import mongoose from 'mongoose';

export interface ISettings {
  guild: string;
  settings: number;
  status: number;
  link: string;
}

export const SettingsSchema = new mongoose.Schema<ISettings>({
  guild: {
    type: String,
    required: true,
    unique: true,
  },
  settings: {
    type: Number,
    required: true,
  },
  status: {
    type: Number,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
});
