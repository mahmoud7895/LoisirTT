import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as express from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io'; // Importer IoAdapter

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Utiliser l'adaptateur Socket.IO
  app.useWebSocketAdapter(new IoAdapter(app));

  // 📁 Configuration du dossier uploads
  const uploadsDir = join(__dirname, '..', 'Uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    logger.log('Dossier "uploads" créé avec succès');
  }

  // 🖼️ Servir les fichiers statiques
  app.use('/uploads', express.static(uploadsDir));
  logger.log(`Service de fichiers statiques configuré sur /uploads`);

  // 🌍 Configuration CORS
  app.enableCors({
    origin: configService.get('FRONTEND_URL', 'http://localhost:3000'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization',
  });

  // 🛡️ Validation globale des données
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 📚 Configuration Swagger
  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('API Gestion Clubs Sportifs')
      .setDescription(
        "Documentation de l'API pour la gestion des clubs sportifs",
      )
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    logger.log('Documentation Swagger disponible sur /api');
  }

  // 🚀 Lancement du serveur
  const port = 3800;
  await app.listen(port);
  logger.log(`Serveur démarré sur http://localhost:${port}`);
}

bootstrap().catch((err) => {
  new Logger('Bootstrap').error('Erreur lors du démarrage:', err);
  process.exit(1);
});
