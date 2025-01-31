export class InviteConfigUpdateRequestDto {
  /**
   * 보안초대링크 사용 여부
   * @example true
   */
  status: boolean

  /**
   * 초대링크 설정 값
   * @example 2
   * @description 2: reCaptcha, 3: oAuth Verify, 4: Toss/SMS Verify
   */
  settings: 2 | 3 | 4

  /**
   * 초대링크 링크 값
   * @example nguard
   */
  link: string

  domain?: {
    /**
     * 커스텀 도메인 주소 값
     * @example custom.nguard.xyz
     */
    domain: string

    /**
     * 커스텀 도메인 SSL 활성화 여부
     * @example true
     */
    ssl: boolean
  }
}

export default InviteConfigUpdateRequestDto
