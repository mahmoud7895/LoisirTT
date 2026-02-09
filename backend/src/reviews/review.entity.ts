import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Evenement } from '../evenements/evenement.entity';
import { User } from '../users/entities/user.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Evenement, (evenement) => evenement.reviews, {
    onDelete: 'CASCADE',
  })
  event: Evenement;

  @ManyToOne(() => User, (user) => user.reviews, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  user: User;

  @Column()
  matricule: string;

  @Column({ nullable: true })
  nom: string;

  @Column({ nullable: true })
  prenom: string;

  @Column({ type: 'int', width: 1 })
  rating: number;

  @Column({ type: 'text' })
  comment: string;

  @Column({ type: 'json', nullable: true })
  sentiment: { label: string; score: number; stars: number };

  @CreateDateColumn()
  createdAt: Date;
}
