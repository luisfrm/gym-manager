import { Navigation } from "@/components/Navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const Template = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return (
    <SidebarProvider>
      <Navigation />

      <main className={cn("px-4 py-4 md:px-6 pt-20 lg:pt-4 flex-1 flex flex-col gap-4", className)}>
        {children}
      </main>
    </SidebarProvider>
  );
};

export default Template;
