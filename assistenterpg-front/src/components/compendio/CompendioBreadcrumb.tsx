// components/compendio/CompendioBreadcrumb.tsx
import Link from 'next/link';

export type BreadcrumbItem = {
  label: string;
  href: string;
};

type CompendioBreadcrumbProps = {
  items: BreadcrumbItem[];
};

export function CompendioBreadcrumb({ items }: CompendioBreadcrumbProps) {
  return (
    <nav className="text-sm text-app-muted mb-6">
      <Link href="/compendio" className="hover:text-app-fg transition-colors">
        📚 Compêndio
      </Link>
      {items.map((item, index) => (
        <span key={index}>
          <span className="mx-2 text-app-muted/50">/</span>
          {index === items.length - 1 ? (
            <span className="text-app-fg font-medium">{item.label}</span>
          ) : (
            <Link href={item.href} className="hover:text-app-fg transition-colors">
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
