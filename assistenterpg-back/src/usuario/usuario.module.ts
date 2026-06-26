//src/usuario/usuario.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { GoogleModule } from 'src/google/google.module';

@Module({
  imports: [PrismaModule, GoogleModule, forwardRef(() => AuthModule)],
  providers: [UsuarioService],
  controllers: [UsuarioController],
  exports: [UsuarioService],
})
export class UsuarioModule {}
