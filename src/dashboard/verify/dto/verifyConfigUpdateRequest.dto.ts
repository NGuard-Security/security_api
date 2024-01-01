import { type APIRole } from 'discord-api-types/v10';

export class verifyConfigUpdateRequestDto {
  /**
   * 버튼 인증 사용 여부
   * @example true
   */
  status: boolean;

  /**
   * 인증 후 지급될 역할 값
   */
  role: APIRole;
}

export default verifyConfigUpdateRequestDto;
