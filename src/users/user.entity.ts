import { Entity, PrimaryGeneratedColumn, Column, OneToMany,ManyToMany } from 'typeorm';
import { Room } from '../rooms/room.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @ManyToMany(() => Room, (room) => room.owner)
  rooms: Room[];
}
