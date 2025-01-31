import { APIRole } from 'discord-api-types/v10'

export class VerifyConfigDto {
  settings?: {
    role: APIRole
  }
  guild: {
    roles: APIRole[]
  }
}

export default VerifyConfigDto
