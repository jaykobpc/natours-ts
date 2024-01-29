import { ITour } from './Tour';
import { IUser } from './User';

export interface IReview {
  review: string;
  rating: number;
  createdAt: Date;
  tour: ITour | string;
  user: IUser | string;
  r: IReview | unknown;
  calcAverageRatings: (x: unknown) => void;
}
