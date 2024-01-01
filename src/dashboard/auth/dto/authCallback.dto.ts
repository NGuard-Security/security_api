export class authCallbackDto {
  /**
   * Access Token
   * @example 6qrZcUqja7812RVdnEKjpzOL4CvHBFG
   */
  access_token: string;

  /**
   * Refresh Token
   * @example D43f5y0ahjqew82jZ4NViEr2YafMKhue
   */
  refresh_token: string;

  /**
   * Access Token의 만료 시간
   * @example 604800
   */
  expires_in: number;

  /**
   * Access Token의 타입
   * @example 'Bearer'
   */
  token_type: string;

  /**
   * Access Token의 범위
   * @example 'identify'
   */
  scope: string;
}

export default authCallbackDto;
