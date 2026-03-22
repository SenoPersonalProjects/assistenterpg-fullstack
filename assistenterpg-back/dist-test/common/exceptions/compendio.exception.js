"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompendioBuscaInvalidaException = exports.CompendioArtigoDuplicadoException = exports.CompendioArtigoException = exports.CompendioSubcategoriaComArtigosException = exports.CompendioSubcategoriaDuplicadaException = exports.CompendioSubcategoriaException = exports.CompendioCategoriaComSubcategoriasException = exports.CompendioCategoriaDuplicadaException = exports.CompendioCategoriaException = void 0;
const common_1 = require("@nestjs/common");
const base_exception_1 = require("./base.exception");
const business_exception_1 = require("./business.exception");
const validation_exception_1 = require("./validation.exception");
class CompendioCategoriaException extends base_exception_1.BaseException {
    constructor(identificador) {
        super('Categoria não encontrada', common_1.HttpStatus.NOT_FOUND, 'COMPENDIO_CATEGORIA_NOT_FOUND', { identificador });
    }
}
exports.CompendioCategoriaException = CompendioCategoriaException;
class CompendioCategoriaDuplicadaException extends business_exception_1.BusinessException {
    constructor(codigo) {
        super(`Categoria com código "${codigo}" já existe`, 'COMPENDIO_CATEGORIA_DUPLICADA', { codigo });
    }
}
exports.CompendioCategoriaDuplicadaException = CompendioCategoriaDuplicadaException;
class CompendioCategoriaComSubcategoriasException extends business_exception_1.BusinessException {
    constructor(categoriaId, quantidadeSubcategorias) {
        super('Não é possível remover categoria com subcategorias', 'COMPENDIO_CATEGORIA_COM_SUBCATEGORIAS', { categoriaId, quantidadeSubcategorias });
    }
}
exports.CompendioCategoriaComSubcategoriasException = CompendioCategoriaComSubcategoriasException;
class CompendioSubcategoriaException extends base_exception_1.BaseException {
    constructor(identificador) {
        super('Subcategoria não encontrada', common_1.HttpStatus.NOT_FOUND, 'COMPENDIO_SUBCATEGORIA_NOT_FOUND', { identificador });
    }
}
exports.CompendioSubcategoriaException = CompendioSubcategoriaException;
class CompendioSubcategoriaDuplicadaException extends business_exception_1.BusinessException {
    constructor(codigo) {
        super(`Subcategoria com código "${codigo}" já existe`, 'COMPENDIO_SUBCATEGORIA_DUPLICADA', { codigo });
    }
}
exports.CompendioSubcategoriaDuplicadaException = CompendioSubcategoriaDuplicadaException;
class CompendioSubcategoriaComArtigosException extends business_exception_1.BusinessException {
    constructor(subcategoriaId, quantidadeArtigos) {
        super('Não é possível remover subcategoria com artigos', 'COMPENDIO_SUBCATEGORIA_COM_ARTIGOS', { subcategoriaId, quantidadeArtigos });
    }
}
exports.CompendioSubcategoriaComArtigosException = CompendioSubcategoriaComArtigosException;
class CompendioArtigoException extends base_exception_1.BaseException {
    constructor(identificador) {
        super('Artigo não encontrado', common_1.HttpStatus.NOT_FOUND, 'COMPENDIO_ARTIGO_NOT_FOUND', { identificador });
    }
}
exports.CompendioArtigoException = CompendioArtigoException;
class CompendioArtigoDuplicadoException extends business_exception_1.BusinessException {
    constructor(codigo) {
        super(`Artigo com código "${codigo}" já existe`, 'COMPENDIO_ARTIGO_DUPLICADO', { codigo });
    }
}
exports.CompendioArtigoDuplicadoException = CompendioArtigoDuplicadoException;
class CompendioBuscaInvalidaException extends validation_exception_1.ValidationException {
    constructor(tamanhoMinimo, tamanhoRecebido) {
        super(`A busca deve ter pelo menos ${tamanhoMinimo} caracteres`, 'query', { tamanhoMinimo, tamanhoRecebido }, 'COMPENDIO_BUSCA_INVALIDA');
    }
}
exports.CompendioBuscaInvalidaException = CompendioBuscaInvalidaException;
//# sourceMappingURL=compendio.exception.js.map