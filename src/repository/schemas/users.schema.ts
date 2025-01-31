import mongoose from 'mongoose'

export interface IUsers {
  userid: string
  servers: string
  oauth: string
  verify: string
  ip: string
  registeredAt: Date
}

export const UsersSchema = new mongoose.Schema<IUsers>({
  userid: {
    type: String,
    required: true,
  },
  servers: {
    type: String,
    required: true,
  },
  oauth: String,
  verify: String,
  ip: {
    type: String,
    required: true,
  },
  registeredAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
})
