"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateHomebrewEquipamentoCustom = validateHomebrewEquipamentoCustom;
const client_1 = require("@prisma/client");
const validation_exception_1 = require("../../common/exceptions/validation.exception");
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function validarFerramentaAmaldicoada(dados) {
    const tipoAmaldicoado = dados.tipoAmaldicoado;
    const temArma = isRecord(dados.armaAmaldicoada);
    const temProtecao = isRecord(dados.protecaoAmaldicoada);
    const temArtefato = isRecord(dados.artefatoAmaldicoado);
    if (!temArma && !temProtecao && !temArtefato) {
        throw new validation_exception_1.ValidationException('Ferramenta amaldi�oada deve ter arma, protecao ou artefato configurado', 'tipoAmaldicoado', {
            camposEsperados: [
                'armaAmaldicoada',
                'protecaoAmaldicoada',
                'artefatoAmaldicoado',
            ],
        }, 'MISSING_AMALDICOADO_PAYLOAD');
    }
    if (tipoAmaldicoado === client_1.TipoAmaldicoado.ITEM) {
        throw new validation_exception_1.ValidationException('Ferramenta amaldi�oada nao suporta tipo ITEM', 'tipoAmaldicoado', {
            tipoRecebido: tipoAmaldicoado,
            tiposValidos: [
                client_1.TipoAmaldicoado.ARMA,
                client_1.TipoAmaldicoado.PROTECAO,
                client_1.TipoAmaldicoado.ARTEFATO,
            ],
        }, 'INVALID_AMALDICOADO_TYPE');
    }
    if (tipoAmaldicoado === client_1.TipoAmaldicoado.ARMA && !temArma) {
        throw new validation_exception_1.ValidationException('tipoAmaldicoado=ARMA exige campo armaAmaldicoada', 'armaAmaldicoada', { tipoAmaldicoado }, 'MISSING_AMALDICOADO_SUBTYPE_DATA');
    }
    if (tipoAmaldicoado === client_1.TipoAmaldicoado.PROTECAO && !temProtecao) {
        throw new validation_exception_1.ValidationException('tipoAmaldicoado=PROTECAO exige campo protecaoAmaldicoada', 'protecaoAmaldicoada', { tipoAmaldicoado }, 'MISSING_AMALDICOADO_SUBTYPE_DATA');
    }
    if (tipoAmaldicoado === client_1.TipoAmaldicoado.ARTEFATO && !temArtefato) {
        throw new validation_exception_1.ValidationException('tipoAmaldicoado=ARTEFATO exige campo artefatoAmaldicoado', 'artefatoAmaldicoado', { tipoAmaldicoado }, 'MISSING_AMALDICOADO_SUBTYPE_DATA');
    }
}
function validarItemAmaldicoado(dados) {
    const tipoAmaldicoado = dados.tipoAmaldicoado;
    if (tipoAmaldicoado !== undefined &&
        tipoAmaldicoado !== client_1.TipoAmaldicoado.ITEM) {
        throw new validation_exception_1.ValidationException('Item amaldi�oado aceita apenas tipoAmaldicoado=ITEM', 'tipoAmaldicoado', { tipoRecebido: tipoAmaldicoado, tipoEsperado: client_1.TipoAmaldicoado.ITEM }, 'INVALID_AMALDICOADO_TYPE');
    }
}
function validateHomebrewEquipamentoCustom(dados) {
    if (!isRecord(dados))
        return;
    if (dados.categoria !== undefined && dados.categoria !== null) {
        const categoriasValidas = [
            'CATEGORIA_0',
            'CATEGORIA_1',
            'CATEGORIA_2',
            'CATEGORIA_3',
            'CATEGORIA_4',
            'ESPECIAL',
        ];
        const categoria = dados.categoria;
        if (typeof categoria !== 'string' ||
            !categoriasValidas.includes(categoria)) {
            const categoriaTexto = typeof categoria === 'string' ? categoria : '<invalida>';
            throw new validation_exception_1.ValidationException(`Categoria invalida: "${categoriaTexto}"`, 'categoria', { categoriasValidas }, 'INVALID_CATEGORY');
        }
    }
    if (dados.espacos !== undefined) {
        const espacos = dados.espacos;
        if (typeof espacos !== 'number' || espacos < 0 || espacos > 10) {
            throw new validation_exception_1.ValorForaDoIntervaloException('espacos', 0, 10, Number(espacos));
        }
    }
    if (dados.tipo === client_1.TipoEquipamento.FERRAMENTA_AMALDICOADA) {
        validarFerramentaAmaldicoada(dados);
    }
    if (dados.tipo === client_1.TipoEquipamento.ITEM_AMALDICOADO) {
        validarItemAmaldicoado(dados);
    }
}
//# sourceMappingURL=validate-homebrew-equipamento.js.map