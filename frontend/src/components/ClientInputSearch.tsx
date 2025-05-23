// interface InputSearchProps {
//   placeholder: string
//   onSelect: () => void
// }

import { useEffect, useId, useState, useRef } from "react";
import { User, Loader2 } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { FormLabel } from "./FormGroup";
import { useDebounce } from "@/hooks/useDebounce";
import { Client } from "@/lib/types";

interface InputSearchProps {
  clients: Array<Client>;
  onSelect?: (client: Client) => void;
  placeholder?: string;
  onChange?: (value: string) => void;
  label?: string;
  isLoading?: boolean;
}

export default function InputSearch({ clients, placeholder, onSelect, onChange, label, isLoading = false }: InputSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const fieldId = useId();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onChange?.(debouncedSearch);
  }, [debouncedSearch, onChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (client: Client) => {
    onSelect?.(client);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-2 flex-1 relative">
      {label && (
        <FormLabel>
          <Label htmlFor={fieldId}>{label}</Label>
        </FormLabel>
      )}
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder || "Ingresa un texto"}
          id={fieldId}
          onFocus={() => setIsOpen(true)}
          className="z-50 pr-8"
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
        />
        {isLoading && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
      {isOpen && search && (
        <Command className="h-72 absolute left-0 top-full mt-2 w-full z-50 bg-popover text-popover-foreground shadow-md rounded-lg border">
          <CommandList className="max-h-60 h-auto overflow-y-auto">
            <CommandGroup heading="Clientes" className="max-h-60 h-auto overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <CommandEmpty>No se encontraron resultados similares.</CommandEmpty>
                  {clients.map(client => (
                    <CommandItem
                      key={client._id}
                      onSelect={() => handleSelect(client)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <User className="h-4 w-4 opacity-50" />
                      <span>
                        {client.firstname} {client.lastname}
                      </span>
                      <span className="ml-auto text-sm text-muted-foreground">{client.cedula}</span>
                    </CommandItem>
                  ))}
                </>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      )}
    </div>
  );
}
