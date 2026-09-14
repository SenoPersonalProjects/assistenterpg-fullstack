import { Module } from '@nestjs/common';
import { ObservabilidadeController } from './observabilidade.controller';
import { ObservabilidadeService } from './observabilidade.service';

@Module({
  controllers: [ObservabilidadeController],
  providers: [ObservabilidadeService],
})
export class ObservabilidadeModule {}
