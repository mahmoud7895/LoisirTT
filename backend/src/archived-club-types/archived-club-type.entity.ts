import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('archived_club_types')
export class ArchivedClubType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'type_id' })
  type_id: number;

  @Column({ length: 100 })
  name: string;

  @CreateDateColumn({ name: 'archived_at' })
  archived_at: Date;

  // Si vous voulez garder cette colonne, assurez-vous qu'elle existe en base
  @Column({ name: 'deleted_by', nullable: true, length: 255 })
  deletedBy?: string;
}
