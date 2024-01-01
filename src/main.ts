import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { version } from '../package.json';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (process.env.SWAGGER !== '0') {
    const config = new DocumentBuilder()
      .setTitle('NGuard Security API')
      .setDescription('NGuard Security 서비스를 위한 백엔드 RestAPI 입니다.')
      .setVersion(version)
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  if (process.env.GLOBAL_CORS === '1') {
    app.enableCors();
  } else {
    app.enableCors({
      origin: [
        'https://console.nguard.xyz',
        'https://console-v2test.nguard.dev',
        'https://checkout.nguard.xyz',
        'https://checkout-v2test.nguard.dev',
      ],
      credentials: true,
    });
  }

  await app.listen(4000);
}

bootstrap();
