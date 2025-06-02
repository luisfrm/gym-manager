import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toastUtils } from "@/lib/toast";

export interface CopyToClipboardProps {
  text: string;
  className?: string;
}

export const CopyToClipboard = ({ text, className }: CopyToClipboardProps) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toastUtils.system.copied();
    } catch (error) {
      console.error("Error copying text: ", error);
      toastUtils.system.copyError();
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className={className}
    >
      <Copy className="h-4 w-4" />
    </Button>
  );
};
