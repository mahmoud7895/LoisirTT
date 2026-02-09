import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TypeActiviteSportive } from '../type-activite-sportive/type-activite-sportive.entity';

@Entity()
export class ActivitesSportives {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  matricule: string;

  @Column()
  nom: string;

  @Column()
  prenom: string;

  @Column({ type: 'int', nullable: true })
  age: number | null;

  @Column()
  beneficiaire: string;

  @ManyToOne(() => TypeActiviteSportive, {
    nullable: true,
    eager: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'type_activite_id' })
  typeActivite: TypeActiviteSportive | null;

  @Column({ name: 'type_activite_id', type: 'int', nullable: true })
  type_activite_id: number | null;

  @Column({ name: 'original_type_activite_id', type: 'int', nullable: true })
  original_type_activite_id: number | null;

  @CreateDateColumn({ type: 'timestamp' })
  date_inscription: Date;
}
