import mongoose from 'mongoose';

export interface IEnterprise {
  billingType: number;
  paymentId: string;
  receiptUrl: string;
  guild: string;
  user: string;
  transaction: any;
  date: Date;
}

export const EnterpriseSchema = new mongoose.Schema<IEnterprise>({
  // 0: 1개월_프로페셔널, 1: 3개월_프로페셔널, 2: 1개월_엔터프라이즈, 3: 3개월_엔터프라이즈
  billingType: {
    type: Number,
    required: true,
  },
  paymentId: {
    type: String,
    required: true,
    unique: true,
  },
  receiptUrl: {
    type: String,
    required: true,
  },
  guild: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: String,
    required: true,
  },
  transaction: {
    type: Object,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
});
