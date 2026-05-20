// components/ui/Icon.tsx

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
  Book,
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
  Calculator,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Clock,
  Target,
  Loader2,
  
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
  Mail,
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
  // Basicos
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
  
  // Navegacao
  'campaign',
  'characters',
  'character-gojo',
  'settings',
  'rules',
  'book',
  'info',
  'home',
  'folder',
  'document',
  'chevron-down',
  'chevron-up',
  'chevron-right',
  'chevron-left',
  'clock',
  'next',
  
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
  
  // Acoes
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
  'mail',
  
  // Temáticos
  'fire',
  'beaker',
  'hand',
  'map',
  'code',
  'star',
  
  // Usuario/Config
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
  
  // Layout/Visualizacao
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
  
  // Midia
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
  
  // RPG/JUJUTSU
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

function CharacterGojoIcon({
  className,
  title,
  strokeWidth = 64,
  ...rest
}: Omit<LucideProps, 'ref'> & { title?: string }) {
  return (
    <svg
      {...rest}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1254 1254"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {title ? <title>{title}</title> : null}
      <path
        fillRule="evenodd"
        paintOrder="stroke fill"
        d="M640.526 150.057c-18.378 10.739-39.761 33.093-53.595 56.027-6.707 11.119-13.842 26.19-17.951 37.916-1.831 5.225-3.469 9.681-3.64 9.902s-4.03-3.16-8.575-7.514c-15.214-14.573-32.071-26.104-53.265-36.436-19.508-9.51-39.37-16.082-50.527-16.718-8.543-.487-8.64-.466-12.231 2.688-5.692 4.997-6.134 7.628-5.396 32.055.734 24.256 2.554 41.939 6.122 59.489 1.339 6.581 2.308 12.091 2.155 12.245s-4.294-1.084-9.201-2.75c-28.298-9.606-59.218-13.922-87.062-12.152-16.164 1.027-18.948 2.204-21.746 9.198-2.089 5.222-2.035 8.332.394 22.542 4.334 25.351 17.15 54.214 33.518 75.485l4.547 5.909-2.786.566c-18.37 3.731-34.22 9.514-47.648 17.384-13.15 7.707-16.638 13.8-12.829 22.41 1.573 3.556 3.61 5.443 11.796 10.924 30.716 20.568 58.478 49.688 70.716 74.176l4.678 9.36v29.303c0 27.651.117 29.545 2.084 33.607 2.493 5.151 8.942 11.048 16.284 14.893l5.362 2.806.669 10.564c1.536 24.215 10.501 57.084 22.028 80.756 18.136 37.247 42.264 64.885 76.772 87.941 63.471 42.406 146.376 46.611 213.63 10.834 57.717-30.704 98.738-85.534 112.114-149.856 1.623-7.802 3.5-20.053 4.172-27.225l1.221-13.038 6.264-3.248c7.536-3.907 14.83-11.383 16.311-16.718.652-2.349 1.08-14.989 1.083-32.01.007-31.022-.264-29.399 7.055-42.372 13.537-23.996 37.013-48.078 66.718-68.442C951.853 442.273 954 439.624 954 433c0-6.324-2.342-9.611-10.769-15.112-13.224-8.633-28.449-14.846-43.731-17.847-10.276-2.018-9.917-1.466-5.098-7.843 18.634-24.659 33.753-61.874 35.213-86.678.441-7.502.224-9.597-1.292-12.449-3.376-6.35-5.658-7.245-20.992-8.228-26.513-1.7-58.939 2.634-84.67 11.317-6.511 2.198-11.988 3.846-12.171 3.663-.183-.182.552-4.605 1.632-9.827 4.809-23.248 7.195-52.659 6.165-75.996l-.596-13.5-3.728-3.75c-3.463-3.484-4.144-3.75-9.595-3.749-3.228.001-10.368 1.095-15.868 2.431-30.408 7.386-66.339 26.933-89.026 48.431-4.61 4.368-6.952 5.981-7.47 5.143-1.328-2.149-11.785-32.106-15.36-44.006-3.42-11.381-10.624-42.253-10.666-45.709-.045-3.665-3.846-10.172-6.85-11.725-5.35-2.766-10.87-2.027-18.602 2.491m-9.179 41.443c-13.471 13.575-21.628 25.056-29.967 42.176-6.223 12.779-13.48 33.975-15.775 46.079-.861 4.539-2.316 9.4-3.233 10.801-3.405 5.196-11.8 7.076-17.241 3.862-1.473-.87-4.319-3.908-6.324-6.75-19.505-27.654-56.693-53.769-92.204-64.75l-5.897-1.824.674 12.775c1.753 33.192 5.442 54.215 13.84 78.86l4.167 12.23-1.951 4.77c-1.57 3.838-2.831 5.216-6.444 7.043-5.505 2.784-7.98 2.396-17.492-2.747-26.673-14.421-60.095-23.005-89.621-23.019L351.258 311l.869 4.75c2.413 13.189 9.243 30.316 18.045 45.25 7.362 12.49 13.442 20.47 24.041 31.56 11.16 11.675 12.521 14.983 9.117 22.157-2.74 5.775-5.714 6.901-20.098 7.612-13.496.666-25.134 2.871-36.929 6.995-11.652 4.075-11.617 3.4-.604 11.683 20.468 15.393 46.474 44.411 56.846 63.428l4.044 7.416 4.456-3.019c6.792-4.602 23.17-12.605 35.74-17.463 31.818-12.298 71.341-20.726 121.715-25.955 23.861-2.477 79.484-3.007 105-1 67.797 5.332 127.763 20.61 164.775 41.982l9.213 5.32 3.37-6.082c12.08-21.795 34.711-47.002 58.928-65.638 6.158-4.738 7.917-6.583 6.848-7.181-.792-.443-6.226-2.407-12.077-4.365-11.218-3.754-27.226-6.397-38.939-6.43-8.623-.025-12.691-2.247-15.09-8.242-2.741-6.851-1.53-9.894 7.837-19.689 21.78-22.774 37.685-51.099 43.041-76.649l1.406-6.708-17.156.533c-28.276.878-51.911 6.978-80.883 20.877-14.204 6.814-15.057 7.09-18.621 6.022-4.803-1.439-9.078-5.926-9.774-10.258-.375-2.329.606-7.201 3.1-15.406 4.778-15.718 7.204-26.242 9.567-41.5 2.027-13.086 4.751-48.538 3.802-49.486-.959-.96-20.953 6.392-31.565 11.605-17.902 8.796-33.334 19.796-46.782 33.349-6.6 6.651-13.8 14.18-16 16.73-5.804 6.729-13.061 7.702-18.979 2.545-4.612-4.02-23.799-57.735-31.948-89.443l-4.318-16.8zM585.5 490.12c-63.619 4.428-128.715 20.843-159.991 40.344-12.339 7.693-11.59 5.561-11.278 32.121l.269 22.915 5.009 2.685c16.901 9.058 66.16 15.808 137.845 18.891 36.822 1.583 146.742.659 175.146-1.473 61.141-4.588 92.746-10.233 104.615-18.685l2.885-2.054v-44.959l-2.75-2.592c-11.362-10.709-44.023-24.469-78.891-33.236-26.271-6.607-59.908-11.809-90.859-14.054-16.234-1.177-64.517-1.12-82 .097M438.45 627.75c6.223 52.625 32.409 101.014 71.55 132.22 57.832 46.107 132.678 54.861 197.5 23.097 51.934-25.448 90.42-73.714 103.314-129.567 2.387-10.34 5.486-30.533 4.793-31.227-.258-.257-5.787.455-12.288 1.583-39.305 6.817-95.815 10.126-172.819 10.121-77.1-.006-135.195-3.288-177.272-10.015-16.86-2.696-15.584-3.023-14.778 3.788m152.823 226.288c-60.693 3.787-117.163 17.884-162.695 40.615-57.627 28.77-100.023 73.795-121.945 129.504-8.019 20.379-14.618 49.415-14.623 64.343-.003 7.3 2.482 11.972 7.48 14.06 4.435 1.854 6.915 1.816 11.093-.166 5.026-2.385 7.124-6.613 7.888-15.894 3.209-39.006 20.33-79.301 47.461-111.704 52.737-62.987 153.535-98.41 271.568-95.438 13.75.347 29.5 1.093 35 1.658 86.836 8.927 151.949 34.863 199.151 79.327 34.226 32.242 57.622 79.421 62.176 125.385.554 5.589 1.578 10.241 2.598 11.798 4.747 7.245 13.997 8.365 20.114 2.436 4.35-4.216 4.879-7.003 3.457-18.227-7.104-56.071-33.979-107.933-74.86-144.462-51.816-46.302-124.07-74.263-212.636-82.286-16.341-1.48-63.815-2.035-81.227-.949"
      />
    </svg>
  );
}

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
    case 'character-gojo':
      return <CharacterGojoIcon {...props} title={title} />;
    case 'settings':
      return withTitle(Settings);
    case 'rules':
      return withTitle(BookOpen);
    case 'book':
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
    case 'clock':
      return withTitle(Clock);
    case 'next':
      return withTitle(ChevronRight);

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
    case 'mail':
      return withTitle(Mail);

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

    // Spinners/Loading
    case 'spinner':
      return <Loader2 {...props} className={`${className} animate-spin`} />;
    case 'loading':
      return <Loader2 {...props} className={`${className} animate-spin`} />;

    // RPG/JUJUTSU
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
