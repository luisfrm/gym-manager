import { CreditCard, Home, LogOut, PanelLeft, Settings, User2, Shield } from "lucide-react";

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
                    className={`${pathname === item.slug ? "bg-slate-700 rounded-md" : ""}`}
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
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </>
  );
}
