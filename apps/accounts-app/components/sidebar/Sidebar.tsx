"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, Mail, Target, Users, Folder, Briefcase, 
  Handshake, CalendarDays, Calculator, FileText, Settings, Cog, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
  href, icon: Icon, label, isActive, isCollapsed
}) => (
  <Link href={href} passHref>
    <Button
      variant="ghost"
      className={
        cn(
          "w-full justify-start h-10",
          isActive && "bg-gray-200 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-700",
          isCollapsed ? "px-2" : "px-4"
        )
      }
    >
      <Icon className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
      {!isCollapsed && label}
    </Button>
  </Link>
);

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/email", icon: Mail, label: "Email" },
    { href: "/strategy-goals", icon: Target, label: "Strategy & Goals" },
    { href: "/crm", icon: Users, label: "CRM" },
    { href: "/clients", icon: Folder, label: "Clients" },
    { href: "/governance", icon: Briefcase, label: "Governance & Re..." },
    { href: "/projects", icon: Handshake, label: "Projects" },
    { href: "/collaboration", icon: CalendarDays, label: "Collaboration" },
    { href: "/collaborate", icon: Cog, label: "Collaborate" },
    { href: "/documents", icon: FileText, label: "Files & Docs" },
    { href: "/calendar-planning", icon: CalendarDays, label: "Calendar & Planni..." },
    { href: "/accounting", icon: Calculator, label: "Accounting" },
    { href: "/co-operatives", icon: BarChart3, label: "Co-Operatives" },
    { href: "/tools", icon: Settings, label: "Tools" },
    { href: "/ai", icon: Cog, label: "AI" },
  ];

  return (
    <div className={cn(
      "flex flex-col h-full bg-gray-100 dark:bg-gray-800 border-r dark:border-gray-700",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex items-center justify-between h-20 px-4 border-b dark:border-gray-700">
        {!isCollapsed && <span className="text-xl font-semibold text-gray-900 dark:text-white">Sebenza One</span>}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-600 dark:text-gray-400"
        >
          {isCollapsed ? <Home className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
        </Button>
      </div>
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={pathname === item.href}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>
      <div className="p-4 border-t dark:border-gray-700">
        <Button className="w-full">
          Connect
        </Button>
      </div>
    </div>
  );
};
