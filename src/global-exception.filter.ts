import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import APIError, { APIErrorCodes } from './common/dto/APIError.dto';

import axios from 'axios';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus = HttpStatus['INTERNAL_SERVER_ERROR'];
    let message: string | object = '내부 서버 오류가 발생했습니다.';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    }

    if (status !== HttpStatus['TOO_MANY_REQUESTS']) {
      try {
        let content =
          '<@&1020555721005334570>\n\n:warning: **[오류 로그]** \n\n';
        content += `\`\`\`오류 내용: ${JSON.stringify(message)}\`\`\`\n`;
        content += `오류 페이지: ${request.url}\n`;

        axios.post(process.env.DISCORD_WEBHOOK_URL, {
          content: content,
        });
      } catch (e) {} // that's fine
    }

    if (message instanceof APIError) {
      response.status(status).json(message);
      return;
    }

    response.status(status).json({
      code: APIErrorCodes[String(status)],
      status: status,
      message: message,
    });
  }
}
