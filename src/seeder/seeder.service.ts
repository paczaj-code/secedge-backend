import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import * as path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  readSqlFile(fileName: string) {
    return readFileSync(path.join('src', 'seeder', 'sql', fileName), 'utf-8');
  }

  async seed() {
    for (let query of this.readSqlFile('seed.sql').split(';')) {
      await this.userRepository.query(query);
    }
  }
}
