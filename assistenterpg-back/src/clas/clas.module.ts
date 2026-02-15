import { Module } from '@nestjs/common';
import { ClasService } from './clas.service';
import { ClasController } from './clas.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ClasService],
  controllers: [ClasController]
})
export class ClasModule {}
