import { ReactNode } from "react";

interface WidgetsContainerProps {
  children: ReactNode;
  className?: string;
}

const WidgetsContainer = ({ children, className = "" }: WidgetsContainerProps) => {
  return (
    <section className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:flex lg:flex-row gap-4 w-full max-w-7xl ${className}`}>
      {children}
    </section>
  );
};

export default WidgetsContainer; 