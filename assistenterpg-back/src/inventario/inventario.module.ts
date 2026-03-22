import { Module } from '@nestjs/common';
import { InventarioController } from './inventario.controller';
import { InventarioService } from './inventario.service';
import { InventarioEngine } from './engine/inventario.engine';
import { InventarioMapper } from './inventario.mapper';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InventarioController],
  providers: [InventarioService, InventarioEngine, InventarioMapper],
  exports: [InventarioService, InventarioEngine, InventarioMapper], // ← Para usar em outros módulos se necessário
})
export class InventarioModule {}
