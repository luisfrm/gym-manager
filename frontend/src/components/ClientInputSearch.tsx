// interface InputSearchProps {
//   placeholder: string
//   onSelect: () => void
// }

import { useEffect, useId, useState } from "react";
import { User } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { FormGroup, FormLabel } from "./FormGroup";
import { useDebounce } from "@/hooks/useDebounce";
import { Client } from "@/lib/types";

interface InputSearchProps {
  clients: Array<Client>;
  onSelect?: (client: Client) => void;
  placeholder?: string;
  onChange?: (value: string) => void;
  label?: string;
}

export default function InputSearch({ clients, placeholder, onSelect, onChange, label }: InputSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const fieldId = useId();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    onChange?.(debouncedSearch);
  }, [debouncedSearch, onChange]);

  return (
    <FormGroup className="flex flex-col gap-2 flex-1 relative">
      {label && (
        <FormLabel>
          <Label htmlFor={fieldId}>{label}</Label>
        </FormLabel>
      )}
      <Input
        type="text"
        placeholder={placeholder || "Ingresa un texto"}
        id={fieldId}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 100)}
        className="z-50"
        value={search}
        onChange={e => {
          setSearch(e.target.value);
        }}
      />
      {isOpen && search && (
        <Command className="h-72 absolute left-0 top-full mt-2 w-full z-50 bg-popover text-popover-foreground shadow-md rounded-lg border">
          <CommandList className="max-h-60 h-auto overflow-y-auto">
            <CommandGroup heading="Clientes" className="max-h-60 h-auto overflow-y-auto">
              <CommandEmpty>No se encontraron resultados similares.</CommandEmpty>
              {clients.map(client => (
                <CommandItem
                  key={client._id}
                  onSelect={() => {
                    onSelect?.(client);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <User className="h-4 w-4 opacity-50" />
                  <span>
                    {client.firstname} {client.lastname}
                  </span>
                  <span className="ml-auto text-sm text-muted-foreground">{client.cedula}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      )}
    </FormGroup>
  );
}
