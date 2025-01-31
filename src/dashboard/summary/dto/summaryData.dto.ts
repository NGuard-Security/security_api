export class SummaryDataDto {
  /**
   * 전체 봇 수
   * @example 30
   */
  bot: number

  /**
   * 전체 멤버 수
   * @example 100
   */
  user: number

  /**
   * 최근 새 멤버
   * @example 10
   */
  newUser: number

  /**
   * 전체 블랙리스트 유저 수
   * @example 100
   */
  blackUser: number

  /**
   * 초대링크 이용 유저 그래프
   * @example [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
   */
  chartData: number[]
}

export default SummaryDataDto
