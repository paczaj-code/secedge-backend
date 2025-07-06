import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ActivityToSite } from './activity-to-site.entity';

/**
 * Represents a Site entity with properties such as id, uuid, name, address, and description.
 * This class is mapped to the 'sites' table in the database.
 */
@Entity({ name: 'sites' })
export class Site {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Generated('uuid')
  uuid: string;

  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ nullable: false, type: 'text' })
  address: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToMany(() => User, (user) => user.other_sites)
  public users_other_sites?: User[];

  @OneToMany(() => ActivityToSite, (activityToSite) => activityToSite.site_id)
  public activities_to_sites?: ActivityToSite[];
}
