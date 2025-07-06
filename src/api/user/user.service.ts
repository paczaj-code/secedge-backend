import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

// import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}
  // create(createUserDto: CreateUserDto) {
  //   return 'This action adds a new user';
  // }

  findAll() {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.default_site', 'site')
      .leftJoinAndSelect('user.other_sites', 'other_sites')
      .select([
        'user.id',
        'user.uuid',
        'user.first_name',
        'user.last_name',
        'user.email',
        'user.phone',
        'user.default_site',
        'site.name',
        'site.id',
        'user.role',
        'site.uuid',
        'other_sites.name',
        'other_sites.id',
        'other_sites.uuid',
        'user.created_at',
        'user.updated_at',
      ])
      .orderBy('user.id', 'ASC');

    return queryBuilder.getMany();
  }

  findOne(uuid: string) {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.default_site', 'site')
      .leftJoinAndSelect('user.other_sites', 'other_sites')
      .select([
        'user.id',
        'user.uuid',
        'user.first_name',
        'user.last_name',
        'user.email',
        'user.phone',
        'user.default_site',
        'site.name',
        'site.uuid',
        'user.role',

        'other_sites.name',
        'other_sites.uuid',
      ]);

    return queryBuilder.where('user.uuid = :uuid', { uuid }).getOne();
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
