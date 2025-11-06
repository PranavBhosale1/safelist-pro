'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItemProps = {
  label: string;
  href: string;
};

function NavItem({ label, href }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  const baseClasses = 'block w-full px-4 py-3 rounded-xl text-left transition-all duration-200 font-medium ';
  const activeClasses = isActive
    ? 'bg-green-600 text-white'
    : 'text-gray-700 hover:bg-green-100 hover:text-green-700';

  return (
    <Link href={href} className={baseClasses + activeClasses}>
      {label}
    </Link>
  );
}

export default NavItem;
