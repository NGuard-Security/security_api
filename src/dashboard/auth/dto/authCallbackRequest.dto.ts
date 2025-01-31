export class AuthCallbackRequestDto {
  /**
   * Discord에서 발급한 authorization code
   * @example 'NhhvTDYsFcdgNLnnLijcl7Ku7bEEeee'
   */
  code: string
}

export default AuthCallbackRequestDto
