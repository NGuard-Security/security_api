export class GuildDto {
  /**
   * 서버 ID값
   * @example '949972766457757716'
   */
  id: string

  /**
   * 서버 이름
   * @example 'NGuard Supports'
   */
  name: string

  /**
   * 서버 아이콘 Hash
   * @example '6a871492f72e11e8232631c24fc5944e'
   */
  icon: string

  member_count: {
    /**
     * 서버 전체 인원
     * @example 74
     */
    everyone: number

    /**
     * 서버 온라인 인원
     * @example 27
     */
    online: number
  }
  config: {
    /**
     * 캡챠 인증 사용여부
     * @example true
     */
    captcha: boolean

    /**
     * OAuth2 인증 사용여부
     * @example true
     */
    oauth: boolean

    /**
     * 고도화 본인인증 사용여부
     * @example false
     */
    verify: boolean
  }
}
