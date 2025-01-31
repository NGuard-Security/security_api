import mongoose from 'mongoose'

export interface IBlacklist {
  guild: string
  user: string
  reason: string
  date: Date
}

export const BlacklistSchema = new mongoose.Schema<IBlacklist>({
  guild: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
})
