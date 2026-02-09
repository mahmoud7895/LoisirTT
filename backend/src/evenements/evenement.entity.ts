import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Review } from '../reviews/review.entity';
import { Inscription } from '../evenement-inscriptions/inscription.entity';

@Entity()
export class Evenement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  eventName: string;

  @Column()
  eventDate: string;

  @Column()
  startTime: string;

  @Column()
  eventLocation: string;

  @Column()
  ticketNumber: number;

  @Column('decimal', { precision: 10, scale: 2 })
  ticketPrice: number;

  @Column({ type: 'varchar', nullable: true })
  eventImage: string | null;

  @OneToMany(() => Review, (review) => review.event)
  reviews: Review[];

  @OneToMany(() => Inscription, (inscription) => inscription.event)
  inscriptions: Inscription[];
}
