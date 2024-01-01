import { HttpService } from '@nestjs/axios';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { Cache } from 'cache-manager';
import { Request } from 'express';

import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

import { type APIUser } from 'discord-api-types/v10';
import { APIError, APIErrorCodes } from 'src/common/dto/APIError.dto';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly httpService: HttpService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new HttpException(
        new APIError(
          APIErrorCodes['401'],
          HttpStatus['UNAUTHORIZED'],
          '로그인이 필요합니다.',
        ),
        HttpStatus['UNAUTHORIZED'],
      );
    }

    try {
      const cachedUser = await this.cacheManager.get<APIUser>(`user:${token}`);

      if (cachedUser) {
        request['user'] = cachedUser;
        return true;
      }

      const { data } = await firstValueFrom(
        this.httpService
          .get<APIUser>('https://discord.com/api/v10/users/@me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .pipe(
            catchError((err: AxiosError) => {
              this.logger.error(
                `GetUser Error => ${JSON.stringify(err.response.data)}`,
              );

              throw err;
            }),
          ),
      );

      await this.cacheManager.set(`user:${token}`, data, 3600);
      request['user'] = data;
    } catch (e) {
      if (e instanceof AxiosError && e.response?.status === 429) {
        throw new HttpException(
          new APIError(
            APIErrorCodes['429'],
            HttpStatus['TOO_MANY_REQUESTS'],
            'Discord API 요청이 지연되고 있습니다. 잠시 후 다시 시도해주세요.',
            e.response?.data,
          ),
          HttpStatus['TOO_MANY_REQUESTS'],
        );
      }

      throw new HttpException(
        new APIError(
          APIErrorCodes['401'],
          HttpStatus['UNAUTHORIZED'],
          '로그인 토큰이 만료되었거나 올바르지 않은 접근입니다.',
        ),
        HttpStatus['UNAUTHORIZED'],
      );
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    this.logger.debug(`Extracted Type => ${type}, Token => ${token}`);
    return type === 'Bearer' ? token : undefined;
  }
}
