import { ISettings } from 'src/repository/schemas/settings.schema'

export class InviteConfigDto {
  settings: ISettings

  /**
   * 한디리 응답 값
   * @example { voted: false, lastVote: 0 }
   */
  koreanbots: {
    voted: boolean
    lastVote: number
  }

  /**
   * Premiere 레벨 (0: 일반, 1: 프리미엄, 2: 엔터프라이즈)
   * @example 0
   */
  premiumType: number

  /**
   * 커스텀 도메인 정보
   * @example { guild: '123456789012345678', domain: 'example.com', ssl: true }
   */
  domain?: {
    guild: string
    domain: string
    ssl: boolean
  }
}

export default InviteConfigDto
