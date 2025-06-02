import { Input } from "./input";
import { Label } from "./label";
import { UseFormRegister } from "react-hook-form";
import { FormLabelError } from "../FormGroup";
import { cn } from "@/lib/utils";
import React, { useState, useRef, useEffect } from "react";
import { SuggestionsDropdown } from "./suggestions-dropdown";
import { SuggestionOption } from "@/lib/types";

interface FormInputProps {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  error?: string;
  disabled?: boolean;
  type?: string;
  placeholder?: string;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  value?: string;
  icon?: React.ReactNode;
  // Props para sugerencias
  suggestions?: SuggestionOption[];
  onSuggestionSelect?: (option: SuggestionOption) => void;
  suggestionsLoading?: boolean;
  suggestionsEmptyMessage?: string;
  suggestionsGroupHeading?: string;
}

export const FormInput = ({
  label,
  name,
  register,
  error,
  disabled = false,
  type = "text",
  placeholder,
  required = false,
  onChange,
  onBlur,
  value,
  icon,
  suggestions,
  onSuggestionSelect,
  suggestionsLoading = false,
  suggestionsEmptyMessage = "No se encontraron opciones.",
  suggestionsGroupHeading = "Opciones"
}: FormInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasSuggestions = suggestions && suggestions.length > 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Mostrar sugerencias si hay sugerencias disponibles (no requiere texto)
    if (hasSuggestions) {
      setShowSuggestions(true);
    }
    
    // Llamar al onChange original si existe
    if (onChange) {
      onChange(e);
    }
  };

  const handleInputFocus = () => {
    // Abrir sugerencias inmediatamente al hacer focus si hay sugerencias disponibles
    if (hasSuggestions) {
      setShowSuggestions(true);
    }
  };

  const handleSuggestionSelect = (option: SuggestionOption) => {
    setInputValue(option.label);
    setShowSuggestions(false);
    
    // Actualizar el valor del form
    const inputElement = containerRef.current?.querySelector('input');
    if (inputElement) {
      inputElement.value = option.label;
      inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Llamar al callback de selección
    if (onSuggestionSelect) {
      onSuggestionSelect(option);
    }
  };

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sincronizar con el valor prop
  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value);
    }
  }, [value]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {error && <FormLabelError>{error}</FormLabelError>}
      </div>
      
      <div className="relative" ref={containerRef}>
        {icon ? (
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
              {icon}
            </div>
            <Input
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              value={value}
              autoComplete="off"
              className={cn(
                "pl-10", // Add left padding when icon is present
                disabled && "bg-gray-50"
              )}
              {...register(name, {
                onChange: handleInputChange,
                onBlur
              })}
              onFocus={handleInputFocus}
            />
          </div>
        ) : (
          <Input
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            value={value}
            autoComplete="off"
            {...register(name, {
              onChange: handleInputChange,
              onBlur
            })}
            onFocus={handleInputFocus}
          />
        )}

        {/* Dropdown de sugerencias */}
        {hasSuggestions && (
          <SuggestionsDropdown
            isOpen={showSuggestions}
            options={suggestions}
            searchValue={inputValue}
            onSelect={handleSuggestionSelect}
            isLoading={suggestionsLoading}
            emptyMessage={suggestionsEmptyMessage}
            groupHeading={suggestionsGroupHeading}
          />
        )}
      </div>
    </div>
  );
}; 