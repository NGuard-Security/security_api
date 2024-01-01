import mongoose from 'mongoose';

export interface IVerify {
  guild: string;
  role: string;
}

export const VerifySchema = new mongoose.Schema<IVerify>({
  guild: String,
  role: String,
});
