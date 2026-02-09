import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Review } from '../../reviews/review.entity';
import { Inscription } from '../../evenement-inscriptions/inscription.entity';

@Entity()
@Unique(['matricule'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 5 })
  matricule: string;

  @Column()
  nom: string;

  @Column()
  prenom: string;

  @Column()
  email: string;

  @Column()
  telephone: string;

  @Column()
  login: string;

  @Column()
  motDePasse: string;

  @Column({
    type: 'enum',
    enum: [
      'Espace TT Nabeul',
      'ULS Nabeul Technique',
      'SAAF',
      'SRH',
      'Direction',
    ],
    default: 'Espace TT Nabeul',
  })
  residenceAdministrative: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date_inscription: Date;

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => Inscription, (inscription) => inscription.user)
  inscriptions: Inscription[];
}
