import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class TypeActiviteSportive {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column({ type: 'varchar', default: 'en cours' })
  status: string;
}
