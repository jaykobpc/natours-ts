import {
  Model,
  Schema,
  model,
  Types,
  Query,
  CallbackWithoutResultAndOptionalError,
} from 'mongoose';

import Tour from './tourModel';
import { IReview } from '../types/Review';

const reviewSchema = new Schema<IReview, Model<IReview>>(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: Types.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre<Query<IReview[], IReview>>(
  /^find/,
  function (next: CallbackWithoutResultAndOptionalError) {
    this.populate({
      path: 'user',
      select: 'name photo',
    });
    next();
  },
);

reviewSchema.statics.calcAverageRatings = async function (tourId: string) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post<Query<IReview[], IReview>>('save', function () {
  (this.constructor as unknown as IReview).calcAverageRatings(
    (this as unknown as IReview).tour,
  );
});

reviewSchema.pre<Query<IReview[], IReview>>(
  /^findOneAnd/,
  async function (next: CallbackWithoutResultAndOptionalError) {
    (this as unknown as IReview).r = await this.findOne();
    next();
  },
);

reviewSchema.post(/^findOneAnd/, async function () {
  await (this as Record<string, any>).r.constructor.calcAverageRatings(
    (this as Record<string, any>).r.tour,
  );
});

const Review = model<IReview>('Review', reviewSchema);

export default Review;
