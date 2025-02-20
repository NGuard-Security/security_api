import { type APIRole } from 'discord-api-types/v10'

export class VerifyConfigUpdateRequestDto {
  /**
   * 버튼 인증 사용 여부
   * @example true
   */
  status: boolean

  /**
   * 인증 후 지급될 역할 값
   */
  role: Pick<APIRole, 'id' | 'name'>
}

export default VerifyConfigUpdateRequestDto
