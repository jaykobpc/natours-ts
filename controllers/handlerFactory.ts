import { Request, Response, NextFunction } from 'express';
import { Model } from 'mongoose';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import APIFeatures from '../utils/apiFeatures';

const deleteOne = <K>(FactoryModel: Model<K>) =>
  catchAsync(
    async (
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<AppError | void> => {
      const doc = await FactoryModel.findByIdAndDelete(req.params.id);

      if (!doc) {
        return next(new AppError('No document found with that ID', 404));
      }

      res.status(204).json({
        status: 'success',
        data: null,
      });
    },
  );

const updateOne = <K>(FactoryModel: Model<K>) =>
  catchAsync(
    async (
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<AppError | void> => {
      const doc = await FactoryModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        },
      );

      if (!doc) {
        return next(new AppError('No document found with that ID', 404));
      }

      res.status(200).json({
        status: 'success',
        data: {
          data: doc,
        },
      });
    },
  );

const createOne = <K>(FactoryModel: Model<K>) =>
  catchAsync(
    async (
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<AppError | void> => {
      const doc = await FactoryModel.create(req.body);

      res.status(201).json({
        status: 'success',
        data: {
          data: doc,
        },
      });
    },
  );

const getOne = <K>(FactoryModel: Model<K>, popOptions?: any) =>
  catchAsync(
    async (
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<AppError | void> => {
      let query: any = FactoryModel.findById(req.params.id);
      if (popOptions) query = query.populate(popOptions);
      const doc = await query;

      if (!doc) {
        return next(new AppError('No document found with that ID', 404));
      }

      res.status(200).json({
        status: 'success',
        data: {
          data: doc,
        },
      });
    },
  );

const getAll = <K>(FactoryModel: Model<K>) =>
  catchAsync(
    async (
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<AppError | void> => {
      let filter = {};
      if (req.params.tourId) filter = { tour: req.params.tourId };

      const features = new APIFeatures(FactoryModel.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

      const doc = await features.query;

      res.status(200).json({
        status: 'success',
        results: doc.length,
        data: {
          data: doc,
        },
      });
    },
  );

export default {
  getAll,
  deleteOne,
  updateOne,
  createOne,
  getOne,
};
