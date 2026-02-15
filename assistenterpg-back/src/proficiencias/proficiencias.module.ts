import { Module } from '@nestjs/common';
import { ProficienciasService } from './proficiencias.service';
import { ProficienciasController } from './proficiencias.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ProficienciasService],
  controllers: [ProficienciasController]
})
export class ProficienciasModule {}
