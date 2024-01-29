import { ITour } from './Tour';
import { IUser } from './User';

export interface IBooking {
  tour: ITour | string;
  user: IUser | string;
  price: string | number;
  createdAt: Date;
  paid: boolean;
}
