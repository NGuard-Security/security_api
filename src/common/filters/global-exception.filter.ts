import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import APIException from '../dto/APIException.dto';

import axios from 'axios';
import { FastifyRequest, FastifyReply } from 'fastify';

// HttpException, APIException ...
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    this.logger.error(exception);

    const ctx = host.switchToHttp();
    const response: FastifyReply<any> = ctx.getResponse<FastifyReply>();
    const request: FastifyRequest<any> = ctx.getRequest<FastifyRequest>();

    const responseAt: string = new Date().toISOString();

    let status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object | APIException =
      '내부 서버 오류가 발생했습니다.';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    }

    // TODO - Discord Logging 작업은 함수로 따로 빼기
    if (HttpStatus[status].startsWith('5')) {
      try {
        let content = `<@&1020555721005334570>\n\n:warning: **[오류 로그 - ${HttpStatus[status]}]** \n\n`;
        content += `\`\`\`오류 내용: ${
          message['message'] || message['error'] || JSON.stringify(message)
        }\`\`\`\n`;
        content += `오류 페이지: ${request.url}\n`;

        axios.post(process.env.DISCORD_WEBHOOK_URL, {
          content: content,
        });
      } catch {} // that's fine
    }

    if (exception instanceof APIException) {
      response.status(exception.status).send({
        code: HttpStatus[exception.status],
        status: exception.status,

        data: exception.data,
        message: exception.message,
        responseAt: responseAt,
      });
      return;
    }

    response.status(status).send({
      code: HttpStatus[status],
      status: status,

      message: message['message'] || message['error'] || message,
      responseAt: responseAt,
    });
  }
}
