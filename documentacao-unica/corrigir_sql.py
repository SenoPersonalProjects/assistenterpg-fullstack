import sys

def corrigir_charset(arquivo_entrada, arquivo_saida):
    substituicoes = {
        "/*!40101 SET character_set_client = @saved_cs_client */;":
        "/*!40101 SET character_set_client = utf8mb4 */;",

        "/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;":
        "/*!40101 SET CHARACTER_SET_CLIENT=utf8mb4 */;",

        "/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;":
        "/*!40101 SET CHARACTER_SET_RESULTS=utf8mb4 */;",

        "/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;":
        "/*!40101 SET COLLATION_CONNECTION=utf8mb4_unicode_ci */;",
    }

    with open(arquivo_entrada, "r", encoding="utf-8", errors="ignore") as f:
        conteudo = f.readlines()

    novo_conteudo = []
    for linha in conteudo:
        linha_limpa = linha.strip()

        if linha_limpa in substituicoes:
            nova = substituicoes[linha_limpa] + "\n"
            novo_conteudo.append(nova)
        else:
            novo_conteudo.append(linha)

    with open(arquivo_saida, "w", encoding="utf-8") as f:
        f.writelines(novo_conteudo)

    print("Arquivo corrigido salvo em:", arquivo_saida)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Uso:")
        print("python corrigir_sql.py arquivo_original.sql arquivo_corrigido.sql")
        sys.exit(1)

    corrigir_charset(sys.argv[1], sys.argv[2])