import { Module } from '@nestjs/common';
import { HomebrewsService } from './homebrews.service';
import { HomebrewsController } from './homebrews.controller';
import { PrismaModule } from '../prisma/prisma.module'; // ✅ ADICIONAR

@Module({
  imports: [PrismaModule], // ✅ ADICIONAR
  providers: [HomebrewsService],
  controllers: [HomebrewsController],
  exports: [HomebrewsService], // ✅ OPCIONAL - exportar se outros módulos precisarem
})
export class HomebrewsModule {}
