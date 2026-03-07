import { Module } from '@nestjs/common';
import { OrigensService } from './origens.service';
import { OrigensController } from './origens.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [OrigensService],
  controllers: [OrigensController],
})
export class OrigensModule {}
