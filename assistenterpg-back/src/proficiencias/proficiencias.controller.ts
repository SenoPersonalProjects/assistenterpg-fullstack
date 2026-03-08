import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProficienciasService } from './proficiencias.service';
import { CreateProficienciaDto } from './dto/create-proficiencia.dto';
import { UpdateProficienciaDto } from './dto/update-proficiencia.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('proficiencias')
export class ProficienciasController {
  constructor(private readonly proficienciasService: ProficienciasService) {}

  @Post()
  create(@Body() dto: CreateProficienciaDto) {
    return this.proficienciasService.create(dto);
  }

  @Get()
  findAll() {
    return this.proficienciasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.proficienciasService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProficienciaDto,
  ) {
    return this.proficienciasService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.proficienciasService.remove(id);
  }
}
