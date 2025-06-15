import { Label } from "./label";
import { UseFormRegister } from "react-hook-form";
import { FormLabelError } from "../FormGroup";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

interface FormSelectProps<T extends string> {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
  options: Array<{ value: T; label: string }>;
  onValueChange?: (value: T) => void;
}

export function FormSelect<T extends string>({
  label,
  name,
  register,
  error,
  disabled = false,
  placeholder,
  required = false,
  options,
  onValueChange
}: FormSelectProps<T>) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {error && <FormLabelError>{error}</FormLabelError>}
      </div>
      <Select
        disabled={disabled}
        onValueChange={(value: T) => {
          register(name).onChange({ target: { value } });
          onValueChange?.(value);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem className="cursor-pointer hover:bg-gray-200" key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 