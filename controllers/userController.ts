import multer, { FileFilterCallback } from 'multer';
import { Request, Response, NextFunction } from 'express';
import sharp from 'sharp';

import User from '../models/userModel';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import factory from './handlerFactory';
import { IUser } from '../types/User';

const multerStorage = multer.memoryStorage();

const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError('Not an image! Please upload only images.', 400) as any,
      false,
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

export const uploadUserPhoto = upload.single('photo');

export const resizeUserPhoto = catchAsync(
  async (
    req: Request<{ id: string }> & {
      files: { [key: string]: any };
    },
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    if (!req.file) return next();

    req.file.filename = `user-${(req as Record<string, any>).user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/users/${req.file.filename}`);

    next();
  },
);

const filterObj = (
  obj: IUser,
  ...allowedFields: Array<string>
): { [key: string]: unknown } => {
  const newObj: { [key: string]: unknown } = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el as keyof typeof obj];
  });

  return newObj;
};

export const getMe = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  req.params.id = (req as Record<string, any>).user.id;
  next();
};

export const updateMe = catchAsync(
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<AppError | void> => {
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          'This route is not for password updates. Please use /updateMyPassword.',
          400,
        ),
      );
    }

    const filteredBody = filterObj(req.body, 'name', 'email');
    if (req.file) filteredBody.photo = req.file.filename;

    const updatedUser = await User.findByIdAndUpdate(
      (req as Record<string, any>).user.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  },
);

export const deleteMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await User.findByIdAndUpdate((req as Record<string, any>).user.id, {
      active: false,
    });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  },
);

export const createUser = (req: Request, res: Response): void => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead',
  });
};

export const getUser = factory.getOne(User);
export const getAllUsers = factory.getAll(User);
export const updateUser = factory.updateOne(User);
export const deleteUser = factory.deleteOne(User);
