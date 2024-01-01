import { ISettings } from 'src/repository/schemas/settings.schema';

export class inviteConfigDto {
  settings: ISettings;
  koreanbots: {
    voted: boolean;
    lastVote: number;
  };
  payData?: {
    type: 'PROFESSIONAL' | 'ENTERPRISE';
    expire: string;
  };
  domain?: {
    guild: string;
    domain: string;
    ssl: boolean;
  };
}

export default inviteConfigDto;
