"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateHomebrewDados = validateHomebrewDados;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const business_exception_1 = require("../../common/exceptions/business.exception");
const validation_exception_1 = require("../../common/exceptions/validation.exception");
const criar_homebrew_arma_dto_1 = require("../dto/equipamentos/criar-homebrew-arma.dto");
const criar_homebrew_protecao_dto_1 = require("../dto/equipamentos/criar-homebrew-protecao.dto");
const criar_homebrew_acessorio_dto_1 = require("../dto/equipamentos/criar-homebrew-acessorio.dto");
const criar_homebrew_municao_dto_1 = require("../dto/equipamentos/criar-homebrew-municao.dto");
const criar_homebrew_explosivo_dto_1 = require("../dto/equipamentos/criar-homebrew-explosivo.dto");
const criar_homebrew_ferramenta_amaldicoada_dto_1 = require("../dto/equipamentos/criar-homebrew-ferramenta-amaldicoada.dto");
const criar_homebrew_item_operacional_dto_1 = require("../dto/equipamentos/criar-homebrew-item-operacional.dto");
const criar_homebrew_item_amaldicoado_dto_1 = require("../dto/equipamentos/criar-homebrew-item-amaldicoado.dto");
const criar_homebrew_tecnica_dto_1 = require("../dto/tecnicas/criar-homebrew-tecnica.dto");
const criar_homebrew_origem_dto_1 = require("../dto/origens/criar-homebrew-origem.dto");
const criar_homebrew_trilha_dto_1 = require("../dto/trilhas/criar-homebrew-trilha.dto");
const criar_homebrew_caminho_dto_1 = require("../dto/caminhos/criar-homebrew-caminho.dto");
const criar_homebrew_cla_dto_1 = require("../dto/clas/criar-homebrew-cla.dto");
const criar_homebrew_poder_dto_1 = require("../dto/poderes/criar-homebrew-poder.dto");
const TIPO_EQUIPAMENTO_TO_DTO_MAP = {
    ARMA: criar_homebrew_arma_dto_1.HomebrewArmaDto,
    PROTECAO: criar_homebrew_protecao_dto_1.HomebrewProtecaoDto,
    ACESSORIO: criar_homebrew_acessorio_dto_1.HomebrewAcessorioDto,
    MUNICAO: criar_homebrew_municao_dto_1.HomebrewMunicaoDto,
    EXPLOSIVO: criar_homebrew_explosivo_dto_1.HomebrewExplosivoDto,
    FERRAMENTA_AMALDICOADA: criar_homebrew_ferramenta_amaldicoada_dto_1.HomebrewFerramentaAmaldicoadaDto,
    ITEM_OPERACIONAL: criar_homebrew_item_operacional_dto_1.HomebrewItemOperacionalDto,
    ITEM_AMALDICOADO: criar_homebrew_item_amaldicoado_dto_1.HomebrewItemAmaldicoadoDto,
};
const TIPO_TO_DTO_MAP = {
    TECNICA_AMALDICOADA: criar_homebrew_tecnica_dto_1.HomebrewTecnicaDto,
    ORIGEM: criar_homebrew_origem_dto_1.HomebrewOrigemDto,
    TRILHA: criar_homebrew_trilha_dto_1.HomebrewTrilhaDto,
    CAMINHO: criar_homebrew_caminho_dto_1.HomebrewCaminhoDto,
    CLA: criar_homebrew_cla_dto_1.HomebrewClaDto,
    PODER_GENERICO: criar_homebrew_poder_dto_1.HomebrewPoderDto,
};
async function validateHomebrewDados(tipo, dados) {
    let DtoClass;
    if (tipo === 'EQUIPAMENTO') {
        if (!dados.tipo) {
            throw new validation_exception_1.CampoObrigatorioException('tipo');
        }
        DtoClass = TIPO_EQUIPAMENTO_TO_DTO_MAP[dados.tipo];
        if (!DtoClass) {
            const tiposValidos = Object.keys(TIPO_EQUIPAMENTO_TO_DTO_MAP);
            throw new business_exception_1.HomebrewTipoNaoSuportadoException(dados.tipo, tiposValidos);
        }
    }
    else {
        DtoClass = TIPO_TO_DTO_MAP[tipo];
        if (!DtoClass) {
            const tiposValidos = Object.keys(TIPO_TO_DTO_MAP);
            throw new business_exception_1.HomebrewTipoNaoSuportadoException(tipo, tiposValidos);
        }
    }
    const dtoInstance = (0, class_transformer_1.plainToInstance)(DtoClass, dados);
    const errors = await (0, class_validator_1.validate)(dtoInstance, {
        whitelist: true,
        forbidNonWhitelisted: true,
    });
    if (errors.length > 0) {
        const messages = errors.map((error) => {
            const constraints = error.constraints
                ? Object.values(error.constraints).join(', ')
                : 'Validação falhou';
            return `${error.property}: ${constraints}`;
        });
        throw new business_exception_1.HomebrewDadosInvalidosException(messages);
    }
}
//# sourceMappingURL=validate-homebrew-dados.js.map