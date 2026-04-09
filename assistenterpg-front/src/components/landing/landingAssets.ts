import gojoArt from '../../../imagens/gojo art.jpg';
import mahitoArt from '../../../imagens/mahito art.jpg';
import chosoArt from '../../../imagens/choso art.jpg';
import tojiCover from '../../../imagens/capa toji.png';
import kenjakuCover from '../../../imagens/capa kenjaku.png';
import chosoCover from '../../../imagens/capa choso.png';
import logoJjkJapones from '../../../imagens/outras/logo jjk em japones.png';
import simboloEscola from '../../../imagens/outras/simbolo da escola.png';
import escolaTecnicaJujutsu from '../../../imagens/novos/escola tecnica jujutsu.png';
import hollowPurpleGif from '../../../imagens/novos/hollow purple.gif';
import maldicoesDesastres from '../../../imagens/novos/maldicoes desastres.png';
import malevolentShrineGif from '../../../imagens/novos/malevolent shrine.gif';
import trioGojoJovem from '../../../imagens/novos/trio do gojo jovem.png';

export const landingImages = {
  heroGif: hollowPurpleGif,
  heroWatermark: simboloEscola,
  aboutYouth: trioGojoJovem,
  featuresSchool: escolaTecnicaJujutsu,
  villains: maldicoesDesastres,
  ctaGif: malevolentShrineGif,
  classFeiticeiro: gojoArt,
  classUsuario: mahitoArt,
  classEspirito: maldicoesDesastres,
  classCelestial: chosoArt,
  classCombatente: tojiCover,
  classSentinela: chosoCover,
  classEspecialista: kenjakuCover,
  logoJjkJapones,
  simboloEscola,
} as const;
