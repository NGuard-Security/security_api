import { APIRole } from 'discord-api-types/v10';

export class verifyConfigDto {
  settings?: {
    role: APIRole;
  };
  guild: {
    roles: APIRole[];
  };
}

export default verifyConfigDto;
