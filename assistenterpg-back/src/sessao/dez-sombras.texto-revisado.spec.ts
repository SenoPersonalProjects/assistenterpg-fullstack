import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { revisarTextoDezSombras } from '../../prisma/seeds/haeinsa/texto-revisado';

describe('texto publicado das Dez Sombras', () => {
  it('aplica as correções expressas sem mudar a fonte arquivada', () => {
    const original = readFileSync(
      join(process.cwd(), 'prisma/seeds/haeinsa/fontes/Dez Sombras.md'),
      'utf8',
    );
    const revisado = revisarTextoDezSombras(original);
    expect(revisado).not.toContain('- Caçada Implacável\n');
    expect(revisado).not.toContain('Enxame variável');
    expect(revisado).toContain('AGI 5 / FOR 4 / INT 2 / PRE 3 / VIG 4');
    expect(revisado).toContain('AGI 4 / FOR 6 / INT 2 / PRE 4 / VIG 5');
    expect(revisado).toContain(
      'reinvocar na mesma cena ou antes de descansar não cura',
    );
    expect(revisado).toContain('não inicia Haeinsa com esse voto');
    expect(original).toContain('Enxame variável');
  });
});
