import { Request, Response, NextFunction } from 'express';
import Review from '../models/reviewModel';
import { IReview } from '../types/Review';
import factory from './handlerFactory';


export default {
  setTourUserIds: (
    req: Request<{ id: string; tourId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = (req as Record<string, any>).user.id;
    next();
  },

  getAllReviews: factory.getAll<IReview>(Review),
  getReview: factory.getOne<IReview>(Review),
  createReview: factory.createOne<IReview>(Review),
  updateReview: factory.updateOne<IReview>(Review),
  deleteReview: factory.deleteOne<IReview>(Review),
};
