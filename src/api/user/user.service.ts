import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  findAll() {
    return this.userRepository.query(`
    SELECT users.first_name, users.last_name, users.uuid, users.id, users.email, users.phone, users.role,
       json_agg(json_build_object('name', sites.name, 'uuid', sites.uuid)) as default_site,
CASE
    WHEN array_length(other_site,1)>0  THEN (
    SELECT json_agg(json_build_object('name', sites.name, 'uuid', sites.uuid)) from sites where id = ANY(other_site::integer[])
                                            )
    ELSE Null
END as other_sites
FROM users
INNER JOIN sites ON sites.id = users."defaultSiteId"
GROUP BY users.id, users.first_name, users.last_name, users.other_site
ORDER BY users.id;
    `);
    // const queryBuilder = this.userRepository
    //   .createQueryBuilder('user')
    //   .leftJoinAndSelect('user.default_site', 'site')
    //   .leftJoinAndSelect('user.other_sites', 'other_sites')
    //   .select([
    //     'user.id',
    //     'user.uuid',
    //     'user.first_name',
    //     'user.last_name',
    //     'user.email',
    //     'user.phone',
    //     'user.default_site',
    //     'site.name',
    //     'site.id',
    //     'user.role',
    //     'site.uuid',
    //     'other_sites.name',
    //     'other_sites.id',
    //     'other_sites.uuid',
    //     'user.created_at',
    //     'user.updated_at',
    //   ])
    //   .orderBy('user.id', 'ASC');
    //
    // return queryBuilder.getMany();
  }

  async findOne(uuid: string): Promise<User | null> {
    const user = await this.userRepository
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
        'user.role',
        'site.name',
        'site.uuid',
        'other_sites.name',
        'other_sites.uuid',
      ])
      .where('user.uuid = :uuid', { uuid })
      .getOne();

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;

    // const queryBuilder = this.userRepository
    //   .createQueryBuilder('user')
    //   .leftJoinAndSelect('user.other_sites', 'sites')
    //   .leftJoinAndSelect('user.default_site', 'default_site')
    //   .select([
    //     'user.uuid',
    //     'user.first_name',
    //     'user.last_name',
    //     // 'user.other_site',
    //     'sites.name',
    //     'sites.uuid',
    //     'default_site.name',
    //     'default_site.uuid',
    //   ])
    //   .where('user.uuid = :uuid', { uuid });
    //
    // return queryBuilder.getOne();
  }

  findUserByEmail(email: string) {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.default_site', 'site')
      .leftJoinAndSelect('user.other_sites', 'other_sites')
      .select([
        'user.id',
        'user.uuid',
        'user.hashed_password',
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

    return queryBuilder.where('user.email = :email', { email }).getOne();
  }

  update(uuid: string, updateUserDto: UpdateUserDto) {
    return this.userRepository
      .createQueryBuilder()
      .update(User)
      .set(updateUserDto)
      .where('uuid = :uuid', { uuid })
      .execute();
  }

  remove(uuid: string) {
    return this.userRepository
      .createQueryBuilder()
      .delete()
      .from(User)
      .where('uuid = :uuid', { uuid })
      .execute();
  }

  async toggleActive(uuid: string) {
    const user = await this.findUserByUuid(uuid);
    return this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ is_active: !user.is_active })
      .where('uuid = :uuid', { uuid })
      .execute();
  }

  async findUserByUuid(uuid: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { uuid },
    });
    if (!user) {
      throw new Error(`User with uuid ${uuid} not found`);
    }
    return user;
  }
}
