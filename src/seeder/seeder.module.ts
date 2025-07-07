import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { SeederController } from './seeder.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';

@Module({
  controllers: [SeederController],
  providers: [SeederService],
  imports: [TypeOrmModule.forFeature([User])],
})
export class SeederModule {}
