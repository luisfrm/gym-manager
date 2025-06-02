import { Label } from "./label";
import { Input } from "./input";
import { Button } from "./button";
import { CalendarMinus, CalendarPlus } from "lucide-react";
import { UseFormRegister } from "react-hook-form";
import { FormLabel, FormLabelError } from "@/components/FormGroup";
import { cn } from "@/lib/utils";
import React from "react";

interface DateInputProps {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  error?: string;
  disabled?: boolean;
  onAdjustDate: (months: number) => void;
  placeholder?: string;
  required?: boolean;
  icon?: React.ReactNode;
}

export const DateInput = ({
  label,
  name,
  register,
  error,
  disabled,
  onAdjustDate,
  placeholder,
  required = false,
  icon,
}: DateInputProps) => {
  return (
    <div className="space-y-2">
      <FormLabel>
        <Label>{label}{required && "*"}</Label>
        {error && <FormLabelError>{error}</FormLabelError>}
      </FormLabel>
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none z-10">
            {icon}
          </div>
        )}
        <Input 
          type="date" 
          placeholder={placeholder} 
          {...register(name)} 
          disabled={disabled}
          className={cn(
            "pr-24",
            icon && "pl-10" // Add left padding when icon is present
          )}
        />
        <div className="absolute right-1 flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => onAdjustDate(-1)}
            title="Restar un mes"
            disabled={disabled}
          >
            <CalendarMinus className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-green-500 hover:text-green-600 hover:bg-green-50"
            onClick={() => onAdjustDate(1)}
            title="Agregar un mes"
            disabled={disabled}
          >
            <CalendarPlus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}; 