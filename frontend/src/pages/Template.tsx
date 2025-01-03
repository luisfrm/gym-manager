import { Navigation } from "@/components/Navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const Template = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <Navigation />

      <main className="px-2 py-4 md:px-6 pt-20 lg:pt-4 flex-1">
        {children}
      </main>
    </SidebarProvider>
  );
};

export default Template;
