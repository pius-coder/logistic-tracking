"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { useAuraMutation } from "@/aura/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
}

export function ImageUpload({
  value,
  onChange,
  label = "Image",
  placeholder = "Sélectionner une image",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const uploadMutation = useAuraMutation<{
    dataUrl: string;
    fileName: string;
    prefix: string;
  }, { id: string; key: string; url: string; mimeType: string; size: number }>("admin.uploadFile");

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) return;

      setPreview(URL.createObjectURL(file));

      const reader = new FileReader();
      reader.onload = async (loadEvent) => {
        const dataUrl = loadEvent.target?.result as string;
        try {
          const result = await uploadMutation.mutateAsync({
            dataUrl,
            fileName: file.name,
            prefix: "products",
          });
          onChange(result.url);
        } catch {
          setPreview(null);
        }
      };
      reader.readAsDataURL(file);
    },
    [onChange, uploadMutation],
  );

  const handleClear = useCallback(() => {
    onChange("");
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [onChange]);

  const displayUrl = preview ?? value;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      {displayUrl ? (
        <div className="relative overflow-hidden rounded-md border">
          <Image
            src={displayUrl}
            alt=""
            width={640}
            height={160}
            unoptimized
            className="h-40 w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1 bg-gradient-to-t from-black/50 to-transparent p-2">
            <Button
              type="button"
              variant="default"
              size="xs"
              onClick={() => inputRef.current?.click()}
            >
              {uploadMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Upload className="h-3 w-3" />
              )}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="xs"
              onClick={handleClear}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-input bg-input/10 text-sm text-muted-foreground hover:bg-input/20"
        >
          {uploadMutation.isPending ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <ImagePlus className="h-6 w-6" />
              <span>{placeholder}</span>
            </>
          )}
        </button>
      )}
      {value && !preview ? (
        <p className="truncate text-xs text-muted-foreground">{value}</p>
      ) : null}
    </div>
  );
}
