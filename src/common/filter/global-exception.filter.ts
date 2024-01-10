import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import APIError from '../dto/APIError.dto';
import APIException from '../dto/APIException.dto';

import axios from 'axios';
import { FastifyRequest, FastifyReply } from 'fastify';

// HttpException, APIException ...
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    let status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object | APIError = '내부 서버 오류가 발생했습니다.';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (exception instanceof APIException) {
      status = exception.status;
      message = exception.APIError;
    }

    // TODO - Discord Logging 작업은 함수로 따로 빼기
    if (
      status === HttpStatus.BAD_REQUEST ||
      HttpStatus[status].startsWith('5')
    ) {
      try {
        let content = `<@&1020555721005334570>\n\n:warning: **[오류 로그 - ${HttpStatus[status]}]** \n\n`;
        content += `\`\`\`오류 내용: ${
          message['message'] || message['error'] || JSON.stringify(message)
        }\`\`\`\n`;
        content += `오류 페이지: ${request.url}\n`;

        // TODO - message가 APIError 종류일 경우 error 값이 없기에 처리 필요

        axios.post(process.env.DISCORD_WEBHOOK_URL, {
          content: content,
        });
      } catch (e) {} // that's fine
    }

    if (message instanceof APIError) {
      response.status(status).send({
        code: HttpStatus[message.status],
        status: message.status,
        message: message.message,
        data: message.data,
      });
      return;
    }

    response.status(status).send({
      code: HttpStatus[status],
      status: status,
      message: message['message'] || message['error'] || message,
    });
  }
}
