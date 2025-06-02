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
        // Mobile: Full screen
        "h-screen w-screen max-w-none rounded-none border-0",
        // Desktop: Original behavior with max-height
        "sm:h-auto sm:w-auto sm:max-h-[90svh] sm:rounded-lg sm:border",
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
        // Mobile: Full screen with scroll
        "h-screen w-screen max-w-none rounded-none border-0 overflow-y-auto",
        // Desktop: Original behavior with max-height and scroll
        "sm:h-auto sm:w-auto sm:max-h-[90svh] sm:overflow-y-auto sm:rounded-lg sm:border",
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
    <DialogHeader className="px-1 pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
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
    <div className="flex-1 overflow-y-auto px-1 lg:px-2 py-4">
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
      "px-1 py-4 border-t border-gray-100 flex-shrink-0",
      className
    )}>
      {children}
    </DialogFooter>
  );
};

export default Modal;
