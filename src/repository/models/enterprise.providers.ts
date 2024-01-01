import { Connection } from 'mongoose';
import { EnterpriseSchema } from '../schemas/enterprise.schema';

export const enterpriseProviders = [
  {
    provide: 'ENTERPRISE_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('PreEnterprise', EnterpriseSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
