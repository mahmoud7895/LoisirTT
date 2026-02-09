import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';

export class CreateActiviteSportiveDto {
  @ApiProperty({ description: 'Matricule du participant', example: 'ABC123' })
  @IsString()
  matricule: string;

  @ApiProperty({ description: 'Nom du participant', example: 'Dupont' })
  @IsString()
  nom: string;

  @ApiProperty({ description: 'Prénom du participant', example: 'Jean' })
  @IsString()
  prenom: string;

  @ApiProperty({
    description: 'Âge du participant, requis pour un enfant',
    example: 10,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  age?: number | null;

  @ApiProperty({
    description: 'Type de bénéficiaire',
    example: 'enfant',
    enum: ['enfant', 'Agent TT'],
  })
  @IsEnum(['enfant', 'Agent TT'])
  beneficiaire: string;

  @ApiProperty({
    description: "ID du type d'activité",
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  type_activite_id?: number;
}
