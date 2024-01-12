import { APIResponseDto } from 'src/common/dto/APIResponse.dto';
import { inviteConfigDto } from './inviteConfig.dto';

export class inviteConfigResponseDto extends APIResponseDto {
  data: inviteConfigDto;
}

export default inviteConfigResponseDto;
