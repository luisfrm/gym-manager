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
      <DialogContent className={cn(
        "py-0 flex flex-col",
        // Desktop: max-height 90svh
        "sm:max-h-[90svh]",
        // Mobile: keep default behavior
        "max-h-screen",
        className
      )}>
        {children}
      </DialogContent>
    </Dialog>
  );
};

// Simple modal variant for basic content with scroll
export const SimpleModal = ({
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
      <DialogContent className={cn(
        "py-8", // Keep original padding for simple content
        // Desktop: max-height 90svh with scroll
        "sm:max-h-[90svh] sm:overflow-y-auto",
        // Mobile: keep default behavior
        "max-h-screen overflow-y-auto",
        className
      )}>
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
    <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
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
  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      {children}
    </div>
  );
};

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalFooter = ({ children, className = "flex justify-end" }: ModalFooterProps) => {
  return (
    <DialogFooter className={cn(
      "px-6 py-4 border-t border-gray-100 flex-shrink-0",
      className
    )}>
      {children}
    </DialogFooter>
  );
};

export default Modal;
