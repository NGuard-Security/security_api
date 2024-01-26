import { Connection } from 'mongoose';
import { PushSchema } from '../schemas/push.schema';

export const pushProviders = [
  {
    provide: 'PUSH_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Pushs', PushSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
