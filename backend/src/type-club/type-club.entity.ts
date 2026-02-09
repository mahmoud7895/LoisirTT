import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class TypeClub {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'varchar', default: 'en cours' })
  status: string;
}
