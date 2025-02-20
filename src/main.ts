import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { NestjsRedoxModule } from 'nestjs-redox'

import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'

import { AppModule } from './app.module'
import { version } from '../package.json'

import { GlobalExceptionFilter } from './common/filters/global-exception.filter'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  )

  if (process.env.ENABLE_SWAGGER !== '0') {
    const config = new DocumentBuilder()
      .setTitle('NGuard Security API')
      .setDescription('NGuard Security 서비스를 위한 백엔드 RestAPI 입니다.')
      .setVersion(version)
      .addBearerAuth()
      .build()

    const document = SwaggerModule.createDocument(app, config)

    SwaggerModule.setup('docs', app, document)
    NestjsRedoxModule.setup('redoc', app, document, {
      standalone: true,
    })
  }

  if (process.env.GLOBAL_CORS === '1') {
    app.enableCors()
  } else {
    app.enableCors({
      origin: [
        'https://nguard.xyz',
        'https://home-v2test.nguard.dev',
        'https://console.nguard.xyz',
        'https://console-v2test.nguard.dev',
        'https://checkout.nguard.xyz',
        'https://checkout-v2test.nguard.dev',
      ],
      credentials: true,
    })
  }

  app.useGlobalFilters(new GlobalExceptionFilter())
  app.useGlobalInterceptors(new TransformInterceptor())

  await app.listen(4000, '0.0.0.0')
}

bootstrap()
