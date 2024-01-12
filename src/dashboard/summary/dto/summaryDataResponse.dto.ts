import { APIResponseDto } from 'src/common/dto/APIResponse.dto';
import { summaryDataDto } from './summaryData.dto';

export class summaryDataResponseDto extends APIResponseDto {
  data: summaryDataDto;
}
