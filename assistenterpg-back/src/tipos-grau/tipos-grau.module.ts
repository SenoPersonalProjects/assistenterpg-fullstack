import { Module } from '@nestjs/common';
import { TiposGrauService } from './tipos-grau.service';
import { TiposGrauController } from './tipos-grau.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TiposGrauService],
  controllers: [TiposGrauController],
})
export class TiposGrauModule {}
