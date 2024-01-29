export interface IUser {
  _id: string;
  name: string;
  email: string;
  photo: string;
  role: string;
  passwordCurrent: string;
  password: string | undefined;
  passwordConfirm: string | undefined;
  passwordChangedAt: number | undefined;
  passwordResetToken: string | undefined;
  passwordResetExpires: number | undefined;
  active: boolean;
  find: (obj: any) => void;
  correctPassword: (s: string, hash: string) => Promise<boolean>;
  changedPasswordAfter: (timeStamp: number) => boolean;
  createPasswordResetToken: () => string;
  isModified?: (x: string) => boolean;
  isNew?: boolean;
}
