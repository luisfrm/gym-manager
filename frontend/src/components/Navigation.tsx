import { CreditCard, Home, LogOut, PanelLeft, Settings, User2, Shield, FileBarChart, Target, Zap, Crown, UserCheck } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import { Link, useLocation } from "react-router-dom";
import { useStore } from "@/hooks/useStore";

// Menu items.
const items = [
  {
    title: "Inicio",
    url: "#",
    icon: Home,
    slug: "/dashboard",
  },
  {
    title: "Clientes",
    url: "#",
    icon: User2,
    slug: "/clients",
  },
  {
    title: "Pagos",
    url: "#",
    icon: CreditCard,
    slug: "/payments",
  },
  {
    title: "Reportes",
    url: "#",
    icon: FileBarChart,
    slug: "/reports",
  },
  {
    title: "Clientes+",
    url: "#",
    icon: Target,
    slug: "/reports/clients",
    isSubItem: true,
  },
  {
    title: "Pagos+",
    url: "#",
    icon: Zap,
    slug: "/reports/payments",
    isSubItem: true,
  },
  {
    title: "Verificación Facial",
    url: "#",
    icon: Shield,
    slug: "/face-verification",
  },
  {
    title: "Configuración",
    url: "#",
    icon: Settings,
    slug: "/settings",
  },
];

export function Navigation() {
  const { isMobile, open, setOpenMobile } = useSidebar();
  const { pathname } = useLocation();
  const { logout } = useStore();
  const { user } = useStore(state => state.auth);

  const handleToggleSidebar = () => {
    setOpenMobile(true);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <div className="lg:hidden flex justify-between items-center px-2 py-4 fixed top-0 left-0 right-0 z-10 bg-slate-900">
        <p className="text-lg font-bold text-white">Gym Manager</p>
        <Button variant="default" size="icon" className="h-7 w-7" onClick={handleToggleSidebar}>
          <PanelLeft />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarContent className="bg-slate-900 text-white">
          <SidebarGroup className="relative">
            {!isMobile && <SidebarTrigger className={`${open ? "absolute right-2 top-3" : "hidden"}`} />}
            <SidebarGroupLabel className="text-white">Gym Manager</SidebarGroupLabel>
            <SidebarGroupLabel className="text-white sr-only">Gym Manager</SidebarGroupLabel>
            <SidebarGroupContent className="mt-2" aria-describedby="sidebar-description">
              <SidebarMenu className={`flex flex-col gap-1 ${!open && !isMobile && "items-center"}`}>
                {!isMobile && <SidebarTrigger className={`${open && "hidden"}`} />}
                {items.map(item => (
                  <SidebarMenuItem
                    className={`${pathname === item.slug ? "bg-slate-700 rounded-md" : ""} ${item.isSubItem ? "ml-4" : ""}`}
                    key={item.title}
                  >
                    <SidebarMenuButton asChild>
                      <Link to={item.slug}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <SidebarMenuItem onClick={handleLogout}>
                  <SidebarMenuButton>
                    <LogOut />
                    <span>Cerrar sesión</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {/* User Info Section */}
                <div className={`mt-4 pt-4 border-t border-slate-700 ${!open && !isMobile ? "px-2" : "px-3"}`}>
                  {open || isMobile ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {user?.username || 'Usuario'}
                          </p>
                          <div className="flex items-center space-x-1">
                            {user?.role === 'admin' ? (
                              <>
                                <Crown className="w-3 h-3 text-yellow-400" />
                                <p className="text-xs text-slate-300">Administrador</p>
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3 h-3 text-blue-400" />
                                <p className="text-xs text-slate-300">Empleado</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-2">
                        <div className="flex items-center justify-between text-xs text-slate-300">
                          <span>Estado:</span>
                          <span className="text-green-400 flex items-center">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                            En línea
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-2">
                      <div className="relative">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                          {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-slate-900"></div>
                      </div>
                      {user?.role === 'admin' ? (
                        <Crown className="w-3 h-3 text-yellow-400" />
                      ) : (
                        <UserCheck className="w-3 h-3 text-blue-400" />
                      )}
                    </div>
                  )}
                </div>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </>
  );
}
