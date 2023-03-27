import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,//将不属于DTO属性自动剥离和删除
    forbidNonWhitelisted: true,//存在不在白名单列表的报错
    transform: true,//自动转化参数类型
    transformOptions: {
      enableImplicitConversion: true//不需要显式指定类型
    }
  }));
  await app.listen(3000);
}
bootstrap();
