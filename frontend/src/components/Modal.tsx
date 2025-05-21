import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent 
        className={cn("py-8", className)}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          handleOpenChange(false);
        }}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
};

interface ModalHeaderProps {
  title: string;
  description: string;
}

export const ModalHeader = ({ title, description }: ModalHeaderProps) => {
  return (
    <DialogHeader>
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription>
        <span dangerouslySetInnerHTML={{ __html: description }} />
      </DialogDescription>
    </DialogHeader>
  );
};

interface ModalBodyProps {
  children: React.ReactNode;
}

export const ModalBody = ({ children }: ModalBodyProps) => {
  return children;
};

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalFooter = ({ children, className = "flex justify-end" }: ModalFooterProps) => {
  return <DialogFooter className={cn(className)}>{children}</DialogFooter>;
};

export default Modal;
