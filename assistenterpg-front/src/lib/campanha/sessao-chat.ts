export const LIMITE_MENSAGEM_CHAT_SESSAO = 800;

export function mensagemChatSessaoValida(mensagem: string): boolean {
  const mensagemLimpa = mensagem.trim();
  return (
    mensagemLimpa.length > 0 &&
    mensagemLimpa.length <= LIMITE_MENSAGEM_CHAT_SESSAO
  );
}
