import { Label } from "./label";
import { Input } from "./input";
import { Button } from "./button";
import { CalendarMinus, CalendarPlus } from "lucide-react";
import { UseFormRegister } from "react-hook-form";
import { FormLabel, FormLabelError } from "@/components/FormGroup";

interface DateInputProps {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  error?: string;
  disabled?: boolean;
  onAdjustDate: (months: number) => void;
  placeholder?: string;
  required?: boolean;
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
}: DateInputProps) => {
  return (
    <div className="space-y-2">
      <FormLabel>
        <Label>{label}{required && "*"}</Label>
        {error && <FormLabelError>{error}</FormLabelError>}
      </FormLabel>
      <div className="relative flex items-center">
        <Input 
          type="date" 
          placeholder={placeholder} 
          {...register(name)} 
          disabled={disabled}
          className="pr-24"
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