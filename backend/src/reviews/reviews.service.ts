import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { CreateReviewDto } from './create-review.dto';
import { Evenement } from '../evenements/evenement.entity';
import { User } from '../users/entities/user.entity';
import axios from 'axios';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(Evenement)
    private evenementRepository: Repository<Evenement>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async analyzeSentiment(
    comment: string,
  ): Promise<{ label: string; score: number; stars: number }> {
    try {
      const response = await axios.post('http://localhost:8000/analyze', {
        text: comment,
      });
      const sentiment = response.data;

      if (sentiment.error) {
        throw new Error(sentiment.error);
      }

      return sentiment;
    } catch (error) {
      console.error("Erreur lors de l'analyse de sentiment:", error.message);
      throw new BadRequestException("Erreur lors de l'analyse du sentiment.");
    }
  }

  async createReview(
    createReviewDto: CreateReviewDto,
    userId: number,
  ): Promise<Review> {
    if (createReviewDto.rating < 1 || createReviewDto.rating > 5) {
      throw new BadRequestException('La note doit être entre 1 et 5.');
    }
    if (!createReviewDto.comment.trim()) {
      throw new BadRequestException('Le commentaire ne peut pas être vide.');
    }
    if (createReviewDto.userId !== userId) {
      throw new UnauthorizedException('Utilisateur non autorisé.');
    }
    const event = await this.evenementRepository.findOne({
      where: { id: createReviewDto.eventId },
    });
    if (!event) {
      throw new NotFoundException(
        `Événement avec l'ID ${createReviewDto.eventId} non trouvé.`,
      );
    }
    const user = await this.userRepository.findOne({
      where: { id: createReviewDto.userId },
    });
    if (!user) {
      throw new NotFoundException(
        `Utilisateur avec l'ID ${createReviewDto.userId} non trouvé.`,
      );
    }
    const existingReview = await this.reviewsRepository.findOne({
      where: {
        event: { id: createReviewDto.eventId },
        user: { id: createReviewDto.userId },
      },
    });
    if (existingReview) {
      throw new BadRequestException(
        'Vous avez déjà soumis un avis pour cet événement.',
      );
    }

    const sentiment = await this.analyzeSentiment(createReviewDto.comment);

    const review = this.reviewsRepository.create({
      event,
      user,
      matricule: createReviewDto.matricule,
      nom: user.nom, // Ajout du nom de l'utilisateur
      prenom: user.prenom, // Ajout du prénom de l'utilisateur
      rating: createReviewDto.rating,
      comment: createReviewDto.comment,
      sentiment,
      createdAt: new Date(),
    });

    return this.reviewsRepository.save(review);
  }

  async getReviewsByEvent(eventId: number): Promise<Review[]> {
    return this.reviewsRepository.find({
      where: { event: { id: eventId } },
      relations: ['user', 'event'],
    });
  }

  async getAllReviews(): Promise<Review[]> {
    return this.reviewsRepository.find({
      relations: ['user', 'event'],
      order: { createdAt: 'DESC' },
    });
  }

  async removeReview(id: number): Promise<{ message: string }> {
    const review = await this.reviewsRepository.findOne({
      where: { id },
      relations: ['user', 'event'],
    });

    if (!review) {
      throw new NotFoundException(`Avis avec l'ID ${id} non trouvé.`);
    }

    await this.reviewsRepository.remove(review);
    return { message: 'Avis supprimé avec succès' };
  }
}
