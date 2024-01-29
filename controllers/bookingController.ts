import stripe from 'stripe';
import { Response, Request, NextFunction } from 'express';

import Tour from '../models/tourModel';
import User from '../models/userModel';
import Booking from '../models/bookingModel';
import catchAsync from '../utils/catchAsync';
import factory from './handlerFactory';
import AppError from '../utils/appError';

const stripeKey = `${process.env.STRIPE_SECRET_KEY}`;

const stripeInstance = new stripe(stripeKey, {
  host: 'api.stripe.com',
  port: 443,
  protocol: 'https',
  telemetry: false,
  maxNetworkRetries: 2,
});

const createBookingCheckout = async (session: any) => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email }))?.id;
  const price = session.display_items[0].amount / 100;
  await Booking.create({ tour, user, price });
};

const webhookCheckout = (req: Request, res: Response, next: NextFunction) => {
  const signature = req.headers['stripe-signature'] as string;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, stripeKey);
  } catch (err: any) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed')
    createBookingCheckout(event.data.object);

  res.status(200).json({ received: true });
};

const getCheckoutSession = catchAsync(
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<AppError | void> => {
    const tour = await Tour.findById(req.params.tourId);

    if (!tour) return new AppError('Cound not find tour', 404);

    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
      cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
      customer_email: (req as Record<string, any>).user.email,
      client_reference_id: req.params.tourId,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: tour.price * 100,
            product_data: {
              name: `${tour.name} Tour`,
              description: tour.summary,
              images: [
                `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`,
              ],
            },
          },
          quantity: 1,
        },
      ],
    });

    res.status(200).json({
      status: 'success',
      session,
    });
  },
);

const createBooking = factory.createOne(Booking);
const getBooking = factory.getOne(Booking);
const getAllBookings = factory.getAll(Booking);
const updateBooking = factory.updateOne(Booking);
const deleteBooking = factory.deleteOne(Booking);

export default {
  webhookCheckout,
  getCheckoutSession,
  createBooking,
  getBooking,
  getAllBookings,
  updateBooking,
  deleteBooking
}