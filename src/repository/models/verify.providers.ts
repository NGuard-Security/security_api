import { Connection } from 'mongoose'
import { VerifySchema } from '../schemas/verify.schema'

export const verifyProviders = [
  {
    provide: 'VERIFY_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Verify', VerifySchema),
    inject: ['DATABASE_CONNECTION'],
  },
]
