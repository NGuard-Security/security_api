import { APIResponseDto } from 'src/common/dto/APIResponse.dto';
import { verifyConfigDto } from './verifyConfig.dto';

export class verifyConfigResponseDto extends APIResponseDto {
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

  data: verifyConfigDto;
}

export default verifyConfigResponseDto;
