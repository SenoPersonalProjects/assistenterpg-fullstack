import { buildEnumReference, buildReference } from './json-import-guide.types';

describe('json import guide helpers', () => {
  it('builds enum references using code/name columns', () => {
    const reference = buildEnumReference('status', 'Status', [
      'RASCUNHO',
      'PUBLICADO',
    ]);

    expect(reference).toEqual({
      key: 'status',
      title: 'Status',
      description: undefined,
      columns: ['codigo', 'nome'],
      rows: [
        { codigo: 'RASCUNHO', nome: 'RASCUNHO' },
        { codigo: 'PUBLICADO', nome: 'PUBLICADO' },
      ],
    });
  });

  it('builds catalog references with default columns', () => {
    const reference = buildReference('pericias', 'Pericias', [
      {
        id: 1,
        codigo: 'PERCEPCAO',
        nome: 'Percepcao',
        descricao: 'Teste de percepcao.',
      },
    ]);

    expect(reference.columns).toEqual(['id', 'codigo', 'nome', 'descricao']);
    expect(reference.rows[0]).toMatchObject({
      id: 1,
      codigo: 'PERCEPCAO',
      nome: 'Percepcao',
    });
  });
});
