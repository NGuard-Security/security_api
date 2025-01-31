import { Connection } from 'mongoose'
import { BlacklistSchema } from '../schemas/blacklist.schema'

export const blacklistProviders = [
  {
    provide: 'BLACKLIST_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Blacklist', BlacklistSchema),
    inject: ['DATABASE_CONNECTION'],
  },
]
