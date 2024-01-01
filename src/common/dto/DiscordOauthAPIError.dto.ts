export class DiscordOauthAPIError {
  /**
   * 에러 코드
   * @example 'invalid_grant'
   */
  error: string;

  /**
   * 에러 메시지
   * @example 'Invalid authorization code'
   */
  error_description: string;
}

export default DiscordOauthAPIError;
