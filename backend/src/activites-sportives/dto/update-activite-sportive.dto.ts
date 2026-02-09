import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';

export class UpdateActiviteSportiveDto {
  @ApiProperty({
    description: 'Matricule du participant',
    example: 'ABC123',
    required: false,
  })
  @IsOptional()
  @IsString()
  matricule?: string;

  @ApiProperty({
    description: 'Nom du participant',
    example: 'Dupont',
    required: false,
  })
  @IsOptional()
  @IsString()
  nom?: string;

  @ApiProperty({
    description: 'Prénom du participant',
    example: 'Jean',
    required: false,
  })
  @IsOptional()
  @IsString()
  prenom?: string;

  @ApiProperty({
    description: 'Âge du participant, requis pour un enfant',
    example: 10,
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  age?: number | null;

  @ApiProperty({
    description: 'Type de bénéficiaire',
    example: 'enfant',
    enum: ['enfant', 'Agent TT'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['enfant', 'Agent TT'])
  beneficiaire?: string;

  @ApiProperty({
    description: "ID du type d'activité",
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  type_activite_id?: number;
}
