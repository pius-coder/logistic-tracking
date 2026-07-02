"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CopyMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
  title?: string;
}

export function CopyMessageDialog({ open, onOpenChange, message, title }: CopyMessageDialogProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast.success("Message copié dans le presse-papier.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier le message.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title || "Message à envoyer au client"}</DialogTitle>
          <DialogDescription>
            Copiez ce message et envoyez-le manuellement au client sur WhatsApp.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={message}
          readOnly
          rows={8}
          className="text-sm font-mono"
        />
        <Button onClick={handleCopy} className="w-full">
          {copied ? (
            <><Check className="h-4 w-4 mr-1.5" /> Copié</>
          ) : (
            <><Copy className="h-4 w-4 mr-1.5" /> Copier le message</>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
