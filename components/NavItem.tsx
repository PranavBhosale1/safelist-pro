'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';

type NavItemProps = {
  label: string;
  href: string;
  icon: LucideIcon;
  showLabel: boolean;
};

function NavItem({ label, href, icon: Icon, showLabel }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  const baseClasses = 'flex w-full items-center rounded-xl px-4 py-3 transition-all duration-200';
  const layoutClasses = showLabel ? 'justify-start gap-3' : 'justify-center';
  const activeClasses = isActive
    ? 'bg-green-600 text-white'
    : 'text-gray-700 hover:bg-green-100 hover:text-green-700';

  return (
    <Link
      href={href}
      className={`${baseClasses} ${layoutClasses} ${activeClasses}`}
      aria-label={label}
      title={label}
    >
      <Icon className="h-5 w-5" />
      {showLabel && <span className="text-sm font-medium">{label}</span>}
    </Link>
  );
}

export default NavItem;
