import { HttpStatus } from '@nestjs/common';
import APIError from './APIError.dto';

export default class APIException {
  constructor(status: HttpStatus, message: string, data?: any) {
    this.APIError = new APIError(status, message, data);
    this.status = status;
  }

  /**
   * 에러 ENUM (ENUM Type)
   * @example 500
   * @description HttpStatus.INTERNAL_SERVER_ERROR
   */
  public status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;

  public APIError: APIError;
}
