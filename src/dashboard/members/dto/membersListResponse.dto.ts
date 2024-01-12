import { APIResponseDto } from 'src/common/dto/APIResponse.dto';
import { discordUserDto } from './discordUser.dto';

export class membersListResponseDto extends APIResponseDto {
  data: discordUserDto[];
}
