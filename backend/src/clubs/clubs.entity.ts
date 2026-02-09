import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TypeClub } from '../type-club/type-club.entity';

@Entity()
export class Club {
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

  @ManyToOne(() => TypeClub, { eager: true, onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'type_club_id' })
  type_club: TypeClub | null;

  @Column({ name: 'type_club_id', nullable: true })
  type_club_id: number | null;

  // ✅ Ajout de la relation correcte pour original_type_club
  @ManyToOne(() => TypeClub, {
    eager: false,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'original_type_club_id' })
  original_type_club: TypeClub | null;

  @Column({ name: 'original_type_club_id', nullable: true })
  original_type_club_id: number | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date_inscription: Date;
}
