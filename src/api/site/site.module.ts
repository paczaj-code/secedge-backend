import { Module } from '@nestjs/common';
import { SiteService } from './site.service';
import { SiteController } from './site.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Site } from '../../entities/site.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [SiteController],
  providers: [SiteService],
  imports: [TypeOrmModule.forFeature([Site]), AuthModule],
})
export class SiteModule {}
