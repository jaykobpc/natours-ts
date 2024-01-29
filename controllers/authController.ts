import crypto from 'crypto';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

import User from '../models/userModel';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import Email from '../utils/email';
import { IUser } from '../types/User';

const signToken = (id: string) => {
  return jwt.sign({ id }, `${process.env.JWT_SECRET}`, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const promiseFunction = (token: string, signingKey: string, options = {}) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, signingKey, options, function (onError, onSuccess) {
      if (onError) return reject(onError);
      resolve(onSuccess);
    });
  });
};

const createSendToken = (
  user: IUser,
  statusCode: number,
  req: Request,
  res: Response,
) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() +
        Number(`${process.env.JWT_COOKIE_EXPIRES_IN}`) * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  user.password = undefined;

  return res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

export default {
  signup: catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
      });

      const url = `${req.protocol}://${req.get('host')}/me`;

      await new Email(newUser, url).sendWelcome();

      createSendToken(newUser, 201, req, res);
    },
  ),

  login: catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
      }

      const user = await User.findOne({ email }).select('+password');

      // VERIFY PASSWORD
      const correctPwd = await user?.correctPassword(
        password,
        `${user?.password}`,
      );

      if (!user || !correctPwd) {
        return next(new AppError('Incorrect email or password', 401));
      }

      createSendToken(user, 200, req, res);
    },
  ),

  logout: (req: Request, res: Response): void => {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    res.status(200).json({ status: 'success' });
  },

  protect: catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      let token;

      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
      ) {
        token = req.headers.authorization.split(' ')[1];
      } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
      }

      if (!token) {
        return next(
          new AppError(
            'You are not logged in! Please log in to get access.',
            401,
          ),
        );
      }

      const decoded: JwtPayload = promiseFunction(
        token,
        process.env.JWT_TOKEN as string,
      );

      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next(
          new AppError(
            'The user belonging to this token does no longer exist.',
            401,
          ),
        );
      }

      if (currentUser.changedPasswordAfter(decoded.iat as number)) {
        return next(
          new AppError(
            'User recently changed password! Please log in again.',
            401,
          ),
        );
      }

      (req as Record<string, any>).user = currentUser;
      res.locals.user = currentUser;

      next();
    },
  ),

  isLoggedIn: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    if (req.cookies.jwt) {
      try {
        const decoded: JwtPayload = promiseFunction(
          req.cookies.jwt,
          process.env.JWT_SECRET as string,
        );

        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
          return next();
        }

        if (currentUser.changedPasswordAfter(decoded.iat as number)) {
          return next();
        }

        res.locals.user = currentUser;
        return next();
      } catch (err) {
        return next();
      }
    }

    next();
  },

  restrictTo: (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!roles.includes((req as Record<string, any>).user.role)) {
        return next(
          new AppError(
            'You do not have permission to perform this action',
            403,
          ),
        );
      }

      next();
    };
  },

  forgotPassword: catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return next(new AppError('There is no user with email address.', 404));
      }

      const resetToken = user.createPasswordResetToken();
      await user.save({ validateBeforeSave: false });

      try {
        const resetURL = `${req.protocol}://${req.get(
          'host',
        )}/api/v1/users/resetPassword/${resetToken}`;
        await new Email(user, resetURL).sendPasswordReset();

        res.status(200).json({
          status: 'success',
          message: 'Token sent to email!',
        });
      } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
          new AppError(
            'There was an error sending the email. Try again later!',
            401,
          ),
        );
      }
    },
  ),

  resetPassword: catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      });

      if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
      }
      user.password = req.body.password;
      user.passwordConfirm = req.body.passwordConfirm;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      createSendToken(user, 200, req, res);
    },
  ),
  updatePassword: catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const user = await User.findById(
        (req as Record<string, any>).user.id,
      ).select('+password');

      if (
        !(await user?.correctPassword(
          req.body.passwordCurrent,
          user.password as string,
        ))
      ) {
        return next(new AppError('Your current password is wrong.', 401));
      }

      if (user) {
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        await user.save();
      }

      createSendToken(user as IUser, 200, req, res);
    },
  ),
};
