// create update-user.dto.ts
import { IsString, Length, Matches, IsIn, IsOptional } from 'class-validator';

const residences = [
  'Espace TT Nabeul',
  'ULS Nabeul Technique',
  'SAAF',
  'SRH',
  'Direction',
] as const;

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(4, 5)
  @Matches(/^\d+$/)
  matricule?: string;

  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  prenom?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsString()
  login?: string;

  @IsOptional()
  @IsString()
  motDePasse?: string;

  @IsOptional()
  @IsIn(residences)
  residenceAdministrative?: (typeof residences)[number];
}
