import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PericiasService } from './pericias.service';

@UseGuards(AuthGuard('jwt'))
@Controller('pericias')
export class PericiasController {
  constructor(private readonly periciasService: PericiasService) {}

  @Get()
  findAll() {
    return this.periciasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.periciasService.findOne(+id);
  }
}
