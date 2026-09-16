"use client";

import { Printer } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PrintButtonProps extends ButtonProps {
  url: string;
  label?: string;
}

export function PrintButton({ url, label = "Print", className, ...props }: PrintButtonProps) {
  const handlePrint = () => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.src = url;
    document.body.appendChild(iframe);
    
    toast.info("Preparing print...");
    
    // Cleanup
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 60000);
  };

  return (
    <Button
      onClick={handlePrint}
      className={cn("rounded-xl", className)}
      {...props}
    >
      <Printer className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}