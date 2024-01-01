import { APIResponseDto } from 'src/common/dto/APIResponse.dto';
import { type RESTGetAPICurrentUserGuildsResult } from 'discord-api-types/v10';

export class serversListResponseDto extends APIResponseDto {
  /**
   * 상태 코드 (ENUM)
   * @example 'OPERATION_COMPLETE'
   */
  code: string;

  /**
   * HTTP 상태 코드
   * @example 200
   */
  status: number;

  data: RESTGetAPICurrentUserGuildsResult;
}

export default serversListResponseDto;
