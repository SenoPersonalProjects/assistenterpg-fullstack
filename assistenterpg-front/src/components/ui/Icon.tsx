// components/ui/Icon.tsx - COM BOOK ADICIONADO

'use client';

import {
  Bell,
  Search,
  ArrowLeft,
  Plus,
  Minus,
  X,
  Trash2,
  Edit,
  Check,
  LayoutGrid,
  Users,
  Settings,
  BookOpen,
  Book, // ✅ NOVO: Livro fechado para suplementos
  Info,
  BarChart3,
  Heart,
  Zap,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  GraduationCap,
  Wrench,
  IdCard,
  Tag,
  AlertTriangle,
  AlertCircle,
  List,
  Eye,
  EyeOff,
  ClipboardCheck,
  ExternalLink,
  RefreshCw,
  Home,
  Folder,
  FileText,
  MessageCircle,
  CheckCircle,
  XCircle,
  Flame,
  Beaker,
  Hand,
  Map,
  Code,
  Star,
  User,
  Sun,
  Moon,
  Archive,
  Lock,
  Paintbrush,
  Briefcase,
  Library,
  ShieldAlert,
  Newspaper,
  Box,
  Clock,
  Calculator,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Target,
  Loader2,
  
  // ✅ ÍCONES TEMÁTICOS RPG/JUJUTSU
  Sword,
  Swords,
  Shield,
  Skull,
  Crown,
  Wand2,
  Dices,
  Scroll,
  Ghost,
  Zap as Lightning,
  CircleDot,
  Hexagon,
  Crosshair,
  Activity,
  Package,
  Backpack,
  
  // ✅ ÍCONES ÚTEIS PARA UI
  Filter,
  SortAsc,
  SortDesc,
  Download,
  Upload,
  Save,
  Copy,
  Share2,
  MoreVertical,
  MoreHorizontal,
  Menu,
  Grid,
  Layers,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Repeat,
  Shuffle,
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Link2,
  Unlink,
  Image,
  Film,
  Music,
  type LucideProps,
} from 'lucide-react';

export const ICON_NAMES = [
  // Básicos
  'bell',
  'search',
  'back',
  'forward',
  'add',
  'minus',
  'close',
  'delete',
  'edit',
  'check',
  
  // Navegação
  'campaign',
  'characters',
  'settings',
  'rules',
  'book', // ✅ NOVO: Livro para suplementos
  'info',
  'home',
  'folder',
  'document',
  'chevron-down',
  'chevron-up',
  'chevron-right',
  'chevron-left',
  
  // Dados/Stats
  'chart',
  'heart',
  'bolt',
  'sparkles',
  'shield',
  'training',
  'skills',
  'tools',
  'id',
  'tag',
  'list',
  
  // Feedback
  'warning',
  'error',
  'success',
  'fail',
  
  // Ações
  'eye',
  'eyeOff',
  'copy',
  'copyDone',
  'externalLink',
  'refresh',
  'spinner',
  'loading',
  'filter',
  'sort-asc',
  'sort-desc',
  'download',
  'upload',
  'save',
  'share',
  'menu-vertical',
  'menu-horizontal',
  'menu',
  
  // Social
  'chat',
  
  // Temáticos
  'fire',
  'beaker',
  'hand',
  'map',
  'code',
  'star',
  
  // Usuário/Config
  'user',
  'sun',
  'moon',
  'archive',
  'lock',
  'paint',
  
  // Personagem
  'briefcase',
  'school',
  'library',
  'clan',
  'story',
  'class',
  'strength',
  'chart-up',
  'calculator',
  'target',
  
  // Layout/Visualização
  'grid',
  'layers',
  'maximize',
  'minimize',
  'zoom-in',
  'zoom-out',
  'rotate-cw',
  'rotate-ccw',
  'repeat',
  'shuffle',
  
  // Mídia
  'play',
  'pause',
  'stop',
  'skip-forward',
  'skip-back',
  'volume',
  'volume-off',
  'image',
  'film',
  'music',
  
  // Conectividade
  'wifi',
  'wifi-off',
  'link',
  'unlink',
  
  // ✅ RPG/JUJUTSU
  'sword',
  'swords',
  'shield-defense',
  'curse',
  'rank',
  'technique',
  'dice',
  'scroll',
  'spirit',
  'energy',
  'focus',
  'domain',
  'aim',
  'status',
  'item',
  'inventory',
] as const;

export type IconName = (typeof ICON_NAMES)[number];

type Props = {
  name: IconName;
  title?: string;
} & Omit<LucideProps, 'ref'>;

function assertNever(x: never): never {
  throw new Error(`Icon not handled: ${String(x)}`);
}

export function Icon({ name, className, title, ...rest }: Props) {
  const props = {
    className,
    'aria-label': title,
    ...rest,
  };

  const withTitle = (Component: React.ComponentType<LucideProps>) => {
    if (title) {
      return (
        <Component {...props}>
          <title>{title}</title>
        </Component>
      );
    }
    return <Component {...props} />;
  };

  switch (name) {
    // Básicos
    case 'bell':
      return withTitle(Bell);
    case 'search':
      return withTitle(Search);
    case 'back':
      return withTitle(ArrowLeft);
    case 'forward':
      return <ArrowLeft {...props} className={`${className} scale-x-[-1]`} />;
    case 'add':
      return withTitle(Plus);
    case 'minus':
      return withTitle(Minus);
    case 'close':
      return withTitle(X);
    case 'delete':
      return withTitle(Trash2);
    case 'edit':
      return withTitle(Edit);
    case 'check':
      return withTitle(Check);

    // Navegação
    case 'campaign':
      return withTitle(LayoutGrid);
    case 'characters':
      return withTitle(Users);
    case 'settings':
      return withTitle(Settings);
    case 'rules':
      return withTitle(BookOpen);
    case 'book': // ✅ NOVO: Livro fechado para suplementos
      return withTitle(Book);
    case 'info':
      return withTitle(Info);
    case 'home':
      return withTitle(Home);
    case 'folder':
      return withTitle(Folder);
    case 'document':
      return withTitle(FileText);
    case 'chevron-down':
      return withTitle(ChevronDown);
    case 'chevron-up':
      return withTitle(ChevronUp);
    case 'chevron-right':
      return withTitle(ChevronRight);
    case 'chevron-left':
      return withTitle(ChevronLeft);

    // Stats
    case 'chart':
      return withTitle(BarChart3);
    case 'heart':
      return withTitle(Heart);
    case 'bolt':
      return withTitle(Zap);
    case 'sparkles':
      return withTitle(Sparkles);
    case 'shield':
      return withTitle(ShieldCheck);
    case 'training':
      return withTitle(TrendingUp);
    case 'skills':
      return withTitle(GraduationCap);
    case 'tools':
      return withTitle(Wrench);
    case 'id':
      return withTitle(IdCard);
    case 'tag':
      return withTitle(Tag);
    case 'list':
      return withTitle(List);

    // Feedback
    case 'warning':
      return withTitle(AlertTriangle);
    case 'error':
      return withTitle(AlertCircle);
    case 'success':
      return withTitle(CheckCircle);
    case 'fail':
      return withTitle(XCircle);

    // Ações
    case 'eye':
      return withTitle(Eye);
    case 'eyeOff':
      return withTitle(EyeOff);
    case 'copy':
      return withTitle(Copy);
    case 'copyDone':
      return withTitle(ClipboardCheck);
    case 'externalLink':
      return withTitle(ExternalLink);
    case 'refresh':
      return withTitle(RefreshCw);
    case 'filter':
      return withTitle(Filter);
    case 'sort-asc':
      return withTitle(SortAsc);
    case 'sort-desc':
      return withTitle(SortDesc);
    case 'download':
      return withTitle(Download);
    case 'upload':
      return withTitle(Upload);
    case 'save':
      return withTitle(Save);
    case 'share':
      return withTitle(Share2);
    case 'menu-vertical':
      return withTitle(MoreVertical);
    case 'menu-horizontal':
      return withTitle(MoreHorizontal);
    case 'menu':
      return withTitle(Menu);

    case 'chat':
      return withTitle(MessageCircle);

    // Temáticos básicos
    case 'fire':
      return withTitle(Flame);
    case 'beaker':
      return withTitle(Beaker);
    case 'hand':
      return withTitle(Hand);
    case 'map':
      return withTitle(Map);
    case 'code':
      return withTitle(Code);
    case 'star':
      return withTitle(Star);

    // Config
    case 'user':
      return withTitle(User);
    case 'sun':
      return withTitle(Sun);
    case 'moon':
      return withTitle(Moon);
    case 'archive':
      return withTitle(Archive);
    case 'lock':
      return withTitle(Lock);
    case 'paint':
      return withTitle(Paintbrush);

    // Personagem
    case 'briefcase':
      return withTitle(Briefcase);
    case 'school':
      return withTitle(Library);
    case 'library':
      return withTitle(Library);
    case 'clan':
      return withTitle(ShieldAlert);
    case 'story':
      return withTitle(Newspaper);
    case 'class':
      return withTitle(Box);
    case 'strength':
      return withTitle(Zap);
    case 'chart-up':
      return withTitle(TrendingUp);
    case 'calculator':
      return withTitle(Calculator);
    case 'target':
      return withTitle(Target);

    // Layout/Visualização
    case 'grid':
      return withTitle(Grid);
    case 'layers':
      return withTitle(Layers);
    case 'maximize':
      return withTitle(Maximize2);
    case 'minimize':
      return withTitle(Minimize2);
    case 'zoom-in':
      return withTitle(ZoomIn);
    case 'zoom-out':
      return withTitle(ZoomOut);
    case 'rotate-cw':
      return withTitle(RotateCw);
    case 'rotate-ccw':
      return withTitle(RotateCcw);
    case 'repeat':
      return withTitle(Repeat);
    case 'shuffle':
      return withTitle(Shuffle);

    // Mídia
    case 'play':
      return withTitle(Play);
    case 'pause':
      return withTitle(Pause);
    case 'stop':
      return withTitle(Square);
    case 'skip-forward':
      return withTitle(SkipForward);
    case 'skip-back':
      return withTitle(SkipBack);
    case 'volume':
      return withTitle(Volume2);
    case 'volume-off':
      return withTitle(VolumeX);
    case 'image':
      return withTitle(Image);
    case 'film':
      return withTitle(Film);
    case 'music':
      return withTitle(Music);

    // Conectividade
    case 'wifi':
      return withTitle(Wifi);
    case 'wifi-off':
      return withTitle(WifiOff);
    case 'link':
      return withTitle(Link2);
    case 'unlink':
      return withTitle(Unlink);

    // ✅ Spinners/Loading
    case 'spinner':
      return <Clock {...props} className={`${className} animate-spin`} />;
    case 'loading':
      return <Loader2 {...props} className={`${className} animate-spin`} />;

    // ✅ RPG/JUJUTSU
    case 'sword':
      return withTitle(Sword);
    case 'swords':
      return withTitle(Swords);
    case 'shield-defense':
      return withTitle(Shield);
    case 'curse':
      return withTitle(Skull);
    case 'rank':
      return withTitle(Crown);
    case 'technique':
      return withTitle(Wand2);
    case 'dice':
      return withTitle(Dices);
    case 'scroll':
      return withTitle(Scroll);
    case 'spirit':
      return withTitle(Ghost);
    case 'energy':
      return withTitle(Lightning);
    case 'focus':
      return withTitle(CircleDot);
    case 'domain':
      return withTitle(Hexagon);
    case 'aim':
      return withTitle(Crosshair);
    case 'status':
      return withTitle(Activity);
    case 'item':
      return withTitle(Package);
    case 'inventory':
      return withTitle(Backpack);

    default:
      return assertNever(name);
  }
}
