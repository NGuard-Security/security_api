import { APIResponseDto } from 'src/common/dto/APIResponse.dto';
import { authCallbackDto } from './authCallback.dto';

export class authCallbackResponseDto extends APIResponseDto {
  data: authCallbackDto;
}

export default authCallbackResponseDto;
