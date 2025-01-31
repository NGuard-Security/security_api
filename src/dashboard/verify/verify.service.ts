import { HttpService } from '@nestjs/axios'
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'

import { Cache } from 'cache-manager'

import { Model } from 'mongoose'

import { AxiosError } from 'axios'
import { catchError, firstValueFrom } from 'rxjs'

import { type RESTError, type APIGuild } from 'discord-api-types/v10'

import { VerifyConfigDto } from './dto/verifyConfig.dto'
import { APIException } from 'src/common/dto/APIException.dto'

import { IVerify } from 'src/repository/schemas/verify.schema'

@Injectable()
export class VerifyService {
  private readonly logger = new Logger(VerifyService.name)

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    @Inject('VERIFY_MODEL')
    private readonly verifyModel: Model<IVerify>,
    private readonly httpService: HttpService,
  ) {}

  async getCurrentConfig(id: string): Promise<VerifyConfigDto> {
    const settings = await this.verifyModel.findOne().where('guild').equals(id)

    let guildData: APIGuild

    const cachedGuildData = await this.cacheManager.get<APIGuild>(`guild:${id}`)

    if (cachedGuildData) {
      this.logger.debug(`Cached Guild Data => ${JSON.stringify(guildData)}`)

      guildData = cachedGuildData
    } else {
      const { data } = await firstValueFrom(
        this.httpService
          .get<APIGuild>(`https://discord.com/api/v10/guilds/${id}`, {
            headers: {
              Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
            },
          })
          .pipe(
            catchError((err: AxiosError) => {
              this.logger.error(
                `GetGuild Error => ${JSON.stringify(err.response.data)}`,
              )

              if (err.response?.status === 429) {
                throw new APIException(
                  HttpStatus.TOO_MANY_REQUESTS,
                  'Discord API 요청이 지연되고 있습니다. 잠시 후 다시 시도해주세요.',
                  err.response?.data,
                )
              }

              throw new APIException(
                err.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
                (err.response.data as RESTError)?.message ||
                  '내부 서버 오류가 발생했습니다.',
              )
            }),
          ),
      )

      await this.cacheManager.set(`guild:${id}`, data, 15 * 60 * 1000)

      this.logger.debug(`Guild cache set => ${JSON.stringify(data)}`)
      guildData = data
    }

    const filteredRoles = guildData.roles.filter((role) => {
      if (!role.managed && role.name !== '@everyone') {
        return true
      }
    })

    filteredRoles
      .sort((a, b) => {
        return b.position - a.position
      })
      .reverse()

    if (settings) {
      const role = filteredRoles.find((role) => role.id === settings.role)
      return {
        settings: {
          role: role,
        },
        guild: {
          roles: filteredRoles,
        },
      }
    }

    return {
      guild: {
        roles: filteredRoles,
      },
    }
  }

  async createConfig(id: string, role: string): Promise<boolean> {
    await this.verifyModel.create({
      guild: id,
      role: role,
    })

    return true
  }

  async updateConfig(id: string, role: string): Promise<boolean> {
    await this.verifyModel.updateOne(
      { guild: id },
      {
        guild: id,
        role: role,
      },
    )

    return true
  }

  async removeConfig(id: string): Promise<boolean> {
    await this.verifyModel.deleteOne().where('guild').equals(id)
    return true
  }

  async isAlreadyUsingService(id: string): Promise<boolean> {
    const isAlreadyUsing = await this.verifyModel
      .findOne()
      .where('guild')
      .equals(id)

    return !!isAlreadyUsing
  }
}
