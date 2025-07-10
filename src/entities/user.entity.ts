import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Generated,
  Index,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Site } from './site.entity';
import { UserRoles } from '../enums/userRoles';
import { IsBoolean, IsDate, IsEmail, IsString } from 'class-validator';

/**
 * Represents a User entity with properties for user information, roles,
 * relationships, and activity status. This class is mapped to the 'users' database table.
 */
@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  @Generated('uuid')
  uuid: string;

  @IsString()
  @Column({ nullable: false })
  first_name: string;

  @IsString()
  @Column({ nullable: false })
  last_name: string;

  @IsEmail()
  @Column({ nullable: false })
  email: string;

  @IsString()
  @Column({ nullable: true })
  phone: string;

  @IsString()
  @Column({ nullable: false, select: false })
  hashed_password: string;

  @IsBoolean()
  @Column({ default: true })
  is_init_password: boolean;

  @Column({ default: 'OFFICER' })
  role: UserRoles;

  @ManyToOne(() => Site, (site) => site.id, {
    nullable: false,
  })
  default_site: Site;

  @IsBoolean()
  @Column({ default: true })
  is_active: boolean;

  @IsDate()
  @CreateDateColumn()
  created_at: Date;

  @IsDate()
  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.id)
  public creator?: number;
  //   TODO change to obligatory

  @ManyToMany(() => Site, (site) => site.users_other_sites, {
    cascade: true,
  })
  @JoinTable()
  public other_sites?: Site[];
}
