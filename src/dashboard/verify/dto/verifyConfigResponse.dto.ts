import { APIResponseDto } from 'src/common/dto/APIResponse.dto';
import { verifyConfigDto } from './verifyConfig.dto';

export class verifyConfigResponseDto extends APIResponseDto {
  data: verifyConfigDto;
}

export default verifyConfigResponseDto;
