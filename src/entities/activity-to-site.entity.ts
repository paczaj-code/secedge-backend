import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class ActivityToSite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  activity_id: number;

  @Column()
  site_id: number;

  @Column()
  is_daily: boolean;

  @Column({ nullable: true })
  weekday: number;

  @Column({ type: 'time', nullable: true })
  time: string;

  @Column()
  shift_number: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
