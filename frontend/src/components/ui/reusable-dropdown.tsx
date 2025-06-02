import { ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./dropdown-menu";

interface ReusableDropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "start" | "center" | "end";
  className?: string;
  contentClassName?: string;
}

/**
 * ReusableDropdown - Componente DropdownMenu reutilizable
 * 
 * @param trigger - El elemento que activará el dropdown (ej: Button)
 * @param children - Los items del dropdown (DropdownMenuItem, DropdownMenuSeparator, etc.)
 * @param align - Alineación del contenido del dropdown
 * @param className - Clases CSS para el trigger
 * @param contentClassName - Clases CSS para el contenido del dropdown
 * 
 * @example
 * <ReusableDropdown
 *   trigger={<Button><MoreVertical /></Button>}
 * >
 *   <DropdownMenuItem onClick={handleEdit}>Editar</DropdownMenuItem>
 *   <DropdownMenuSeparator />
 *   <DropdownMenuItem onClick={handleDelete}>Eliminar</DropdownMenuItem>
 * </ReusableDropdown>
 */
export const ReusableDropdown = ({ 
  trigger, 
  children, 
  align = "end",
  className = "",
  contentClassName = ""
}: ReusableDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={className} asChild>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={contentClassName}>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 