import { IsNumber, IsString, IsInt, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateClubDto {
  @IsString()
  matricule: string;

  @IsString()
  nom: string;

  @IsString()
  prenom: string;

  @IsInt()
  @IsOptional() // Age devient optionnel
  age?: number | null;

  @IsString() // Nouveau champ requis
  beneficiaire: string;

  @IsNumber()
  @Transform(({ value }) => (value === '' ? null : Number(value)))
  @IsOptional()
  type_club_id?: number | null;
}
