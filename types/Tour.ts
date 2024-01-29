import { IUser } from './User';
import { IGeoPoints } from './GeoPoints';

export interface ITour {
  name: string;
  slug: string;
  duration: number;
  maxGroupSize: number;
  difficulty: string;
  ratingsAverage: number;
  price: number;
  ratingsQuantity: number;
  priceDiscount: number;
  summary: string;
  description: string;
  imageCover: string;
  images: string[];
  createdAt: Date;
  startDates: string[];
  secretTour: boolean;
  startLocation: IGeoPoints;
  locations: IGeoPoints[];
  guides: IUser | null;
  start?: Number;
  _id: number;
}
