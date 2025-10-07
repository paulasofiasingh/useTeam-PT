import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Configurar CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
  });

  // Configurar validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Configurar prefijo global para API
  app.setGlobalPrefix('api');

  // Solo servir archivos estáticos en producción
  if (process.env.NODE_ENV === 'production') {
    // Servir archivos estáticos del frontend
    app.useStaticAssets(join(__dirname, '..', '..', 'frontend', 'build'));
    
    // Ruta catch-all para servir el index.html del frontend (solo para rutas que no sean API)
    app.use((req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(join(__dirname, '..', '..', 'frontend', 'build', 'index.html'));
    });
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Backend running on: http://localhost:${port}/api`);
  console.log(`📊 WebSocket available on: ws://localhost:${port}`);
}
bootstrap();