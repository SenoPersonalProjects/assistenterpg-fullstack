import { Module } from '@nestjs/common';
import { PericiasService } from './pericias.service';
import { PericiasController } from './pericias.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PericiasService],
  controllers: [PericiasController],
})
export class PericiasModule {}
