export class APIError {
  /**
   * 에러 코드 (ENUM)
   * @example 'INTERNAL_SERVER_ERROR'
   */
  private code: string = APIErrorCodes['500'];

  /**
   * HTTP 상태 코드
   * @example 500
   */
  private status: number = 500;

  /**
   * 에러 메시지
   * @example '내부 서버 오류가 발생했습니다.'
   */
  private message: string = '내부 서버 오류가 발생했습니다.';

  private data?: any;

  constructor(code, status, message, data?) {
    this.code = code;
    this.status = status;
    this.message = message;
    this.data = data;
  }
}

export const APIErrorCodes = {
  '400': 'BAD_REQUEST',
  '401': 'UNAUTHORIZED',
  '403': 'FORBIDDEN',
  '404': 'NOT_FOUND',
  '405': 'METHOD_NOT_ALLOWED',
  '409': 'CONFLICT',
  '410': 'GONE',
  '422': 'UNPROCESSABLE_CONTENT',
  '429': 'TOO_MANY_REQUESTS',
  '500': 'INTERNAL_SERVER_ERROR',
  '501': 'NOT_IMPLEMENTED',
  '503': 'SERVICE_UNAVAILABLE',
};

export default APIError;
