import { Check, Copy } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface CopyToClipboardProps {
  text: string;
}

const CopyToClipboard = ({ text }: CopyToClipboardProps) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  }, [isCopied]);

  const handleOnClick = () => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Texto copiado al portapapeles");
        setIsCopied(true);
      })
      .catch(() => {
        toast.error("Error al copiar el texto");
      });
  };

  return (
    <div>
      {isCopied ? (
        <Check className="w-4 h-4 cursor-pointer" />
      ) : (
        <Copy className="w-4 h-4 cursor-pointer" onClick={handleOnClick} />
      )}
    </div>
  );
};

export default CopyToClipboard;
