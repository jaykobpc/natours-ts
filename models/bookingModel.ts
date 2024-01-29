import {
  Schema,
  Types,
  Model,
  model,
  Query,
  CallbackWithoutResultAndOptionalError,
} from 'mongoose';
import { IBooking } from '../types/Booking';

const bookingSchema = new Schema<IBooking, Model<IBooking>>({
  tour: {
    type: Types.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a tour'],
  },
  user: {
    type: Types.ObjectId,
    ref: 'User',
    required: [true, 'Booking must have a price'],
  },
  price: {
    type: Number,
    required: [true, 'Booking must have a price'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

bookingSchema.pre<Query<IBooking[], IBooking>>(
  /^find/,
  function (next: CallbackWithoutResultAndOptionalError) {
    this.populate('user').populate({
      path: 'tour',
      select: 'name',
    });

    next();
  },
);

const Booking = model<IBooking>('Booking', bookingSchema);

export default Booking;
