import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export const FormLabel = ({ children, className }: Props) => {
  return <div className={cn("flex items-center gap-2", className)}>{children}</div>;
};

export const FormLabelError = ({ children, className }: Props) => {
  return <span className={cn("text-red-500 text-sm font-medium leading-none", className)}>{children}</span>;
};

export const FormGroup = ({ children, className }: Props) => {
  return <div className={cn("flex flex-col gap-3", className)}>{children}</div>;
};
