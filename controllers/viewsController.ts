import { Request, Response, NextFunction } from 'express';
import Tour from '../models/tourModel';
import User from '../models/userModel';
import Booking from '../models/bookingModel';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

const alerts = (req: Request, res: Response, next: NextFunction): void => {
  const { alert } = req.query;
  if (alert === 'booking')
    res.locals.alert =
      'Your booking was successful! Please check your email for a confirmation.';

  next();
};

const getOverview = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const tours = await Tour.find();

    res.status(200).render('overview', {
      title: 'All Tours',
      tours,
    });
  },
);

const getTour = catchAsync(
  async (
    req: Request<{ slug: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<AppError | void> => {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
      path: 'reviews',
      //   fields: 'review rating user',
    });

    if (!tour) {
      return next(new AppError('There is no tour with that name.', 404));
    }

    res.status(200).render('tour', {
      title: `${tour.name} Tour`,
      tour,
    });
  },
);

const getLoginForm = (req: Request, res: Response): void => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

const getAccount = (req: Request, res: Response) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

const getMyTours = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const bookings = await Booking.find({
      user: (req as Record<string, any>).user.id,
    });

    const tourIDs = bookings.map((el) => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIDs } });

    res.status(200).render('overview', {
      title: 'My Tours',
      tours,
    });
  },
);

const updateUserData = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const updatedUser = await User.findByIdAndUpdate(
      (req as Record<string, any>).user.id,
      {
        name: req.body.name,
        email: req.body.email,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).render('account', {
      title: 'Your account',
      user: updatedUser,
    });
  },
);

export default {
  alerts,
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  getMyTours,
  updateUserData,
};
