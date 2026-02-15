import { Module } from '@nestjs/common';
import { AlinhamentosService } from './alinhamentos.service';
import { AlinhamentosController } from './alinhamentos.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AlinhamentosService],
  controllers: [AlinhamentosController]
})
export class AlinhamentosModule {}
