import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NpcsAmeacasController } from './npcs-ameacas.controller';
import { NpcsAmeacasService } from './npcs-ameacas.service';

@Module({
  imports: [PrismaModule],
  controllers: [NpcsAmeacasController],
  providers: [NpcsAmeacasService],
})
export class NpcsAmeacasModule {}
