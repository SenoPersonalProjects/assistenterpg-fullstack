import { Module } from '@nestjs/common';
import { TrilhasService } from './trilhas.service';
import { TrilhasController } from './trilhas.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TrilhasService],
  controllers: [TrilhasController],
})
export class TrilhasModule {}
