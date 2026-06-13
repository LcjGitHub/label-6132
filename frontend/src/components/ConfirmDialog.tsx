import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "确认",
  cancelText = "取消",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") {
        onCancel();
      }
      if (e.key === "Enter") {
        onConfirm();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onConfirm, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div
        className="relative z-10 w-full max-w-md rounded-lg bg-background p-6 shadow-lg border border-border"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="关闭"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="space-y-4">
          <h2
            id="confirm-dialog-title"
            className="text-lg font-semibold leading-none tracking-tight"
          >
            {title}
          </h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              {cancelText}
            </Button>
            <Button
              type="button"
              variant={variant === "destructive" ? "destructive" : "default"}
              onClick={onConfirm}
              autoFocus
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
