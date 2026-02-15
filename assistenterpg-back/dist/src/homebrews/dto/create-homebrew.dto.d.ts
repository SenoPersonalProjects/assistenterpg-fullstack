import { TipoHomebrewConteudo } from '@prisma/client';
import { CreateHomebrewBaseDto } from './base/create-homebrew-base.dto';
import { HomebrewArmaDto } from './equipamentos/criar-homebrew-arma.dto';
import { HomebrewProtecaoDto } from './equipamentos/criar-homebrew-protecao.dto';
import { HomebrewAcessorioDto } from './equipamentos/criar-homebrew-acessorio.dto';
import { HomebrewMunicaoDto } from './equipamentos/criar-homebrew-municao.dto';
import { HomebrewExplosivoDto } from './equipamentos/criar-homebrew-explosivo.dto';
import { HomebrewFerramentaAmaldicoadaDto } from './equipamentos/criar-homebrew-ferramenta-amaldicoada.dto';
import { HomebrewItemOperacionalDto } from './equipamentos/criar-homebrew-item-operacional.dto';
import { HomebrewItemAmaldicoadoDto } from './equipamentos/criar-homebrew-item-amaldicoado.dto';
import { HomebrewTecnicaDto } from './tecnicas/criar-homebrew-tecnica.dto';
import { HomebrewOrigemDto } from './origens/criar-homebrew-origem.dto';
import { HomebrewTrilhaDto } from './trilhas/criar-homebrew-trilha.dto';
import { HomebrewCaminhoDto } from './caminhos/criar-homebrew-caminho.dto';
import { HomebrewClaDto } from './clas/criar-homebrew-cla.dto';
import { HomebrewPoderDto } from './poderes/criar-homebrew-poder.dto';
export declare class CreateHomebrewDto extends CreateHomebrewBaseDto {
    tipo: TipoHomebrewConteudo;
    dados: HomebrewArmaDto | HomebrewProtecaoDto | HomebrewAcessorioDto | HomebrewMunicaoDto | HomebrewExplosivoDto | HomebrewFerramentaAmaldicoadaDto | HomebrewItemOperacionalDto | HomebrewItemAmaldicoadoDto | HomebrewTecnicaDto | HomebrewOrigemDto | HomebrewTrilhaDto | HomebrewCaminhoDto | HomebrewClaDto | HomebrewPoderDto;
}
