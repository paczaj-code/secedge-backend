import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeleteResult,
  Repository,
  SelectQueryBuilder,
  UpdateResult,
} from 'typeorm';
import { User } from '../../entities/user.entity';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  private selectedColumns = [
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
  ];

  /**
   * Creates a new user entity and saves it to the repository.
   *
   * @param {CreateUserDto} createUserDto - The data transfer object containing information required to create a user.
   * @return {Promise<User>} A promise that resolves to the newly created user.
   */
  create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  /**
   * Retrieves all User entities along with their associated site data.
   *
   * Executes a query to fetch all users and their related site information
   * from the database by utilizing the buildUserWithSitesQuery method.
   *
   * @return {Promise<User[]>} A Promise resolving to an array of User objects.
   */
  findAll(): Promise<User[]> {
    return this.buildUserWithSitesQuery().getMany();
  }

  /**
   * Fetches a single user entity based on the provided UUID.
   *
   * @param {string} uuid - The unique identifier of the user to be fetched.
   * @return {Promise<User | null>} A promise that resolves to the user entity if found, or null otherwise.
   * @throws {HttpException} Throws an exception if no user is found with the provided UUID.
   */
  async findOne(uuid: string): Promise<User | null> {
    const user = await this.buildUserWithSitesQuery()
      .where('user.uuid = :uuid', { uuid })
      .getOne();

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  /**
   * Builds a query to retrieve user information along with associated sites data,
   * including both default site and other related sites.
   *
   * @return {Object} A query builder instance configured to fetch user data and associated site details.
   */
  private buildUserWithSitesQuery(): SelectQueryBuilder<User> {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.default_site', 'site')
      .leftJoinAndSelect('user.other_sites', 'other_sites')
      .select(this.selectedColumns);
  }

  /**
   * Finds a user by their email address.
   *
   * @param {string} email - The email address of the user to find.
   * @return {Promise<User>} A promise that resolves to the user object if found.
   * @throws {HttpException} Throws an exception if the user is not found.
   */
  async findUserByEmail(email: string): Promise<User> {
    this.selectedColumns.push('user.hashed_password');
    const user = await this.buildUserWithSitesQuery()
      .where('user.email = :email', {
        email,
      })
      .getOne();

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  /**
   * Updates the user record in the database with the provided data.
   *
   * @param {string} uuid - The unique identifier of the user to be updated.
   * @param {UpdateUserDto} updateUserDto - The object containing the updated user data.
   * @return {Promise<UpdateResult>} A promise that resolves to the result of the update operation.
   */
  update(uuid: string, updateUserDto: UpdateUserDto): Promise<UpdateResult> {
    return this.userRepository
      .createQueryBuilder()
      .update(User)
      .set(updateUserDto)
      .where('uuid = :uuid', { uuid })
      .execute();
  }

  /**
   * Removes a user from the repository based on the provided UUID.
   *
   * @param {string} uuid - The unique identifier of the user to be removed.
   * @return {Promise<DeleteResult>} A promise that resolves to the result of the delete operation.
   */
  remove(uuid: string): Promise<DeleteResult> {
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

  /**
   * Finds a user by their unique UUID.
   *
   * @param {string} uuid - The UUID of the user to be retrieved.
   * @return {Promise<User>} A promise that resolves to the user object if found.
   * @throws {Error} If the user with the specified UUID is not found.
   */
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
