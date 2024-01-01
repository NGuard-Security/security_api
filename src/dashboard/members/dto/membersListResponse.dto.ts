import { APIResponseDto } from 'src/common/dto/APIResponse.dto';
import { discordUserDto } from './discordUser.dto';

export class membersListResponseDto extends APIResponseDto {
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

  data: discordUserDto[];
}
