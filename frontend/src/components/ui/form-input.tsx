import { Input } from "./input";
import { Label } from "./label";
import { UseFormRegister } from "react-hook-form";
import { FormLabelError } from "../FormGroup";

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
}

export function FormInput({
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
  value
}: FormInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {error && <FormLabelError>{error}</FormLabelError>}
      </div>
      <Input
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        {...register(name, {
          onChange,
          onBlur
        })}
      />
    </div>
  );
} 