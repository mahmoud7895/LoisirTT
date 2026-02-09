import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Créer un utilisateur
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Vérifier si la matricule existe déjà
    const existingUser = await this.usersRepository.findOne({
      where: { matricule: createUserDto.matricule },
    });

    if (existingUser) {
      throw new ConflictException('La matricule existe déjà.');
    }

    // Vérifier que motDePasse est défini avant de le hacher
    if (!createUserDto.motDePasse) {
      throw new Error('Le mot de passe est requis pour créer un utilisateur.');
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.motDePasse,
      saltRounds,
    );

    // Créer un nouvel utilisateur avec la date d'inscription
    const user = this.usersRepository.create({
      ...createUserDto,
      motDePasse: hashedPassword,
      date_inscription: new Date(),
    });

    // Sauvegarder l'utilisateur
    return this.usersRepository.save(user);
  }

  // Récupérer tous les utilisateurs
  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  // Récupérer un utilisateur par son ID
  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    return user;
  }

  // Mettre à jour un utilisateur
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Vérifier si matricule est modifié et existe déjà
    if (updateUserDto.matricule && updateUserDto.matricule !== user.matricule) {
      const existingUser = await this.usersRepository.findOne({
        where: { matricule: updateUserDto.matricule },
      });
      if (existingUser) {
        throw new ConflictException('La matricule existe déjà.');
      }
    }

    // Si motDePasse est fourni, le hacher
    if (updateUserDto.motDePasse) {
      const saltRounds = 10;
      updateUserDto.motDePasse = await bcrypt.hash(
        updateUserDto.motDePasse,
        saltRounds,
      );
    }

    // Mettre à jour uniquement les champs fournis
    Object.assign(user, updateUserDto);

    // Sauvegarder les modifications
    return this.usersRepository.save(user);
  }

  // Supprimer un utilisateur
  async remove(id: number): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    await this.usersRepository.remove(user);
  }

  // Trouver un utilisateur par son login
  async findOneByLogin(login: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { login } });
  }
}
