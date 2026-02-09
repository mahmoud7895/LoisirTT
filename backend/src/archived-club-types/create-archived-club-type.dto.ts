import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateArchivedClubTypeDto {
  @ApiProperty({ description: 'ID du type original', example: 1 })
  @IsNumber()
  type_id: number;

  @ApiProperty({ description: 'Nom du type', example: 'Football' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Utilisateur ayant effectué la suppression',
    example: 'admin@example.com',
    required: false,
  })
  @IsString()
  @IsOptional()
  deletedBy?: string;
}
