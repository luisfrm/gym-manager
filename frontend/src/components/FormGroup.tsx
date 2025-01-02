import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
}

const FormGroup = ({ children, className }: Props) => {
	return <div className={cn("flex flex-col space-y-2", className)}>{children}</div>;
};

export default FormGroup