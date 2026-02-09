import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Evenement } from '../evenements/evenement.entity';
import { User } from '../users/entities/user.entity';

@Entity('inscription_evenement')
export class Inscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  matricule: string;

  @Column({ length: 100 })
  nom: string;

  @Column({ length: 100 })
  prenom: string;

  @Column({ type: 'int', nullable: true })
  age: number | null;

  @Column({ length: 50 })
  beneficiaire: string;

  @Column({ length: 50 })
  payment: string;

  @Column({ length: 255 })
  eventname: string;

  @Column({ type: 'int' })
  eventId: number;

  @Column({ type: 'int', nullable: true }) // Modifier pour permettre NULL
  userId: number | null;

  @Column({ type: 'int' })
  numberOfTickets: number;

  @Column({ type: 'float' })
  totalAmount: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date_inscription: Date;

  @Column({ length: 50, default: 'En cours' })
  eventStatus: string;

  @ManyToOne(() => Evenement, (evenement) => evenement.inscriptions)
  event: Evenement;

  @ManyToOne(() => User, (user) => user.inscriptions, { nullable: true }) // Mettre à jour la relation
  user: User | null;
}
