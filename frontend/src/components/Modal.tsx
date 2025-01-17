import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
export const Modal = ({
  isOpen,
  onOpenChange,
  children,
  className = "sm:max-w-3xl",
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={cn("py-8", className)}>{children}</DialogContent>
    </Dialog>
  );
};

export const ModalHeader = ({ title, description }: { title: string; description: string }) => {
  return (
    <DialogHeader>
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription>{description}</DialogDescription>
    </DialogHeader>
  );
};

export const ModalBody = ({ children }: { children: React.ReactNode }) => {
  return children;
};

export const ModalFooter = ({
  children,
  className = "flex justify-end",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <DialogFooter className={cn(className)}>{children}</DialogFooter>;
};

export default Modal;
