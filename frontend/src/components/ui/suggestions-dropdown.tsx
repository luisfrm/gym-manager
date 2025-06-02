import React from "react";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Loader2 } from "lucide-react";
import { SuggestionsDropdownProps } from "@/lib/types";

export const SuggestionsDropdown: React.FC<SuggestionsDropdownProps> = ({
  isOpen,
  options,
  searchValue,
  onSelect,
  isLoading = false,
  emptyMessage = "No se encontraron resultados.",
  groupHeading = "Opciones",
  className = ""
}) => {
  // Filtrar opciones basado en la búsqueda
  // Si no hay texto de búsqueda, mostrar todas las opciones
  const filteredOptions = searchValue.trim() === "" 
    ? options 
    : options.filter(option =>
        option.label.toLowerCase().includes(searchValue.toLowerCase()) ||
        (option.description && option.description.toLowerCase().includes(searchValue.toLowerCase()))
      );

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className={`absolute left-0 top-full mt-1 w-full z-50 bg-popover text-popover-foreground shadow-lg rounded-lg border ${className}`}
      style={{ minHeight: 'auto', maxHeight: '240px' }}
    >
      <Command className="border-0 shadow-none">
        <CommandList 
          className="max-h-48 overflow-y-auto p-1" 
          style={{ minHeight: 'auto', height: 'auto' }}
        >
          <CommandGroup heading={groupHeading}>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Cargando...</span>
              </div>
            ) : (
              <>
                <CommandEmpty className="py-6 text-center text-sm">{emptyMessage}</CommandEmpty>
                {filteredOptions.map(option => (
                  <CommandItem
                    key={option.id}
                    onSelect={() => onSelect(option)}
                    className="flex items-center gap-3 cursor-pointer p-3 hover:bg-accent hover:text-accent-foreground rounded-md mb-1"
                    style={{ minHeight: '60px' }}
                  >
                    {option.icon && (
                      <div className="flex-shrink-0 text-muted-foreground">
                        {option.icon}
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {option.label}
                      </div>
                      {option.description && (
                        <div className="text-sm text-muted-foreground truncate">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </>
            )}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}; 