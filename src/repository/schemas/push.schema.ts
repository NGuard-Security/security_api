// import mongoose from 'mongoose';

export interface IPush {
  id: string;
  guild: string;
  kind: string;
  title: string;
  content: string;
  button: object;
  date: string;
  due: string;
}

// export const PushSchema = new mongoose.Schema<IPush>({
//   id: {
//     type: String,
//     default: new mongoose.Types.ObjectId().toString(),
//   },
//   guild: {
//     type: String,
//     required: true,
//   },
//   kind: {
//     type: String,
//     required: true,
//   },
//   title: {
//     type: String,
//     required: true,
//   },
//   content: {
//     type: String,
//     required: true,
//   },
//   button: {
//     type: Object,
//     required: true,
//   },
//   date: {
//     type: String,
//     default: String(new Date().getTime()),
//   },
//   due: {
//     type: String,
//     required: true,
//   },
// });
