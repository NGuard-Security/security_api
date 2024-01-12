import { APIResponseDto } from 'src/common/dto/APIResponse.dto';
import { type RESTGetAPICurrentUserGuildsResult } from 'discord-api-types/v10';

export class serversListResponseDto extends APIResponseDto {
  data: RESTGetAPICurrentUserGuildsResult;
}

export default serversListResponseDto;
