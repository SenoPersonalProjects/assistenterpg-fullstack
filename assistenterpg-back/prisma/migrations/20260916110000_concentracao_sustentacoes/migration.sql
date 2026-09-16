-- A sustentação registra explicitamente se exige Concentração. O valor padrão
-- preserva todas as sustentações legadas como efeitos que não a exigem.
ALTER TABLE `PersonagemSessaoHabilidadeSustentada`
  ADD COLUMN `requerConcentracao` BOOLEAN NOT NULL DEFAULT false;
