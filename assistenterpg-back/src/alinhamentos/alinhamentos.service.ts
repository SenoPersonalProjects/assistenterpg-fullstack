import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AlinhamentosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.alinhamento.findMany({
      orderBy: { nome: 'asc' },
    });
  }
}
