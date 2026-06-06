import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

type TableRow = Record<string, string>;

async function main() {
  const prisma = new PrismaClient();
  try {
    const tableRows = await prisma.$queryRawUnsafe<TableRow[]>('SHOW TABLES');
    const tableNames = tableRows.flatMap((row) => Object.values(row));
    const usuarioTable = tableNames.find(
      (tableName) => tableName.toLowerCase() === 'usuario',
    );
    if (!usuarioTable || !/^[A-Za-z0-9_]+$/.test(usuarioTable)) {
      throw new Error('Tabela física de Usuario não encontrada.');
    }

    const duplicates = await prisma.$queryRawUnsafe<{ total: bigint }[]>(
      `SELECT COUNT(*) AS total FROM (
        SELECT LOWER(TRIM(email))
        FROM \`${usuarioTable}\`
        GROUP BY LOWER(TRIM(email))
        HAVING COUNT(*) > 1
      ) AS normalized_duplicates`,
    );
    const [
      unverifiedUsers,
      activeSessions,
      activeTokens,
      pendingRegistrations,
    ] = await Promise.all([
      prisma.usuario.count({ where: { emailVerificadoEm: null } }),
      prisma.sessaoAutenticacao.count({
        where: { revogadaEm: null, expiraEm: { gt: new Date() } },
      }),
      prisma.authToken.count({
        where: { usadoEm: null, expiraEm: { gt: new Date() } },
      }),
      prisma.registroPendenteUsuario.count({
        where: { expiraEm: { gt: new Date() } },
      }),
    ]);

    console.log(
      JSON.stringify(
        {
          usuarioPhysicalTable: usuarioTable,
          unverifiedUsers,
          activeSessions,
          activeTokens,
          pendingRegistrations,
          normalizedDuplicateEmailGroups: Number(duplicates[0]?.total ?? 0),
        },
        null,
        2,
      ),
    );

    if (Number(duplicates[0]?.total ?? 0) > 0) {
      throw new Error(
        'Existem emails duplicados após normalização; resolva antes do deploy.',
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

void main();
