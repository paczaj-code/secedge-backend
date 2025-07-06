import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './api/user/user.module';
import ormConfig from './config/orm.config';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'frontend', 'browser'),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [ormConfig],
      expandVariables: true,
      envFilePath:
        process.env.NODE_ENV !== 'production'
          ? `${process.env.NODE_ENV}.env`
          : '.env',
    }),
    TypeOrmModule.forRoot(ormConfig()),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
