export class VerifyRequestDto {
  /**
   * 서버 ID값
   * @example '949972766457757716'
   */
  guild: string

  /**
   * 캡챠 인증값
   * @example XXXX.DUMMY.TOKEN.XXXX
   */
  'cf-turnstile-response'?: string

  /**
   * OAuth2 인증값
   * @example XXXX.DUMMY.TOKEN.XXXX
   */
  'oauth-response'?: string

  /**
   * 고도화 본인인증값
   * @example XXXX.DUMMY.TOKEN.XXXX
   */
  'verify-response'?: string
}
