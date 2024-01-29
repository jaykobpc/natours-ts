export interface IGeoPoints {
  type: {
    type: string;
    default: string;
    point: ['Point'];
  };
  coordinates: number[];
  address: string;
  description: string;
}
