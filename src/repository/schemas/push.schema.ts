import mongoose from 'mongoose';

export interface IPush {
  id: string;
  guild: string;
  kind: string; // 0 | 1 | 2 | 3 | 4
  title: string;
  content: string;
  button: object;
  date: Date;
  due: string;
}

export const PushSchema = new mongoose.Schema<IPush>({
  id: {
    type: String,
    required: true,
  },
  guild: {
    type: String,
    required: true,
  },
  kind: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  button: {
    type: Object,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  due: {
    type: String,
    required: true,
  },
});
