import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('archived_sport_activity_types')
export class ArchivedSportActivityType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'type_id' })
  type_id: number;

  @Column()
  nom: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  archived_at: Date;

  @Column({ nullable: true })
  deleted_by: string;
}
