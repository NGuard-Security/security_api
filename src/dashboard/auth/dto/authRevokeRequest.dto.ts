export class AuthRevokeRequestDto {
  /**
   * Discord에서 발급한 access_token 또는 refresh_token
   * @example '6qrZcUqja7812RVdnEKjpzOL4CvHBFG'
   * @example 'D43f5y0ahjqew82jZ4NViEr2YafMKhue'
   */
  token: string

  /**
   * Token 타입 정보
   * @example access_token
   * @example refresh_token
   */
  token_type_hint: string = 'access_token'
}

export default AuthRevokeRequestDto
