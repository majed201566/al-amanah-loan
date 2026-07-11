"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Upload, X, FileText, Check, AlertTriangle } from "lucide-react";
import { validateFile, validateImageFile, formatFileSize, MAX_FILE_SIZE, MAX_IMAGE_SIZE } from "@/lib/validators";

interface FileUploadProps {
  label: string;
  description?: string;
  accept?: string;
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  required?: boolean;
  preview?: boolean;
  className?: string;
  imageOnly?: boolean; // New: if true, only accept images
}

export default function FileUpload({
  label,
  description,
  accept,
  value,
  onChange,
  error,
  required = false,
  preview = true,
  className,
  imageOnly = false,
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Default accept based on imageOnly flag - keep same design, just filter types
  const effectiveAccept = accept || (imageOnly ? ".jpg,.jpeg,.png,.webp,.heic,.heif" : ".jpg,.jpeg,.png,.webp,.pdf");
  const maxSize = imageOnly ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;

  const displayError = error || localError;

  const handleFile = (file: File | null) => {
    setLocalError(null);
    if (!file) {
      onChange(null);
      return;
    }

    // Use image-only validation for the 6 required fields
    const validationError = imageOnly ? validateImageFile(file) : validateFile(file);
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    onChange(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file || null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setLocalError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const isImage = value?.type?.startsWith("image/") || (value && /\.(jpg|jpeg|png|webp|heic|heif)$/i.test(value.name));
  const previewUrl = value && isImage ? URL.createObjectURL(value) : null;

  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-sm font-medium text-navy-700">
        {label}
        {required && <span className="text-red-400 mr-1">*</span>}
      </label>

      {description && (
        <p className="text-xs text-navy-400">{description}</p>
      )}

      {/* Drop Zone */}
      {!value ? (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300",
            dragOver
              ? "border-gold-400 bg-gold-50/50"
              : displayError
              ? "border-red-300 bg-red-50/30"
              : "border-navy-200 bg-navy-50/30 hover:border-gold-300 hover:bg-gold-50/20"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={effectiveAccept}
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] || null)}
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-2"
          >
            <div
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                dragOver ? "bg-gold-100" : "bg-navy-100"
              )}
            >
              <Upload
                className={cn(
                  "w-6 h-6",
                  dragOver ? "text-gold-500" : "text-navy-400"
                )}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-navy-700">
                اسحب الصورة هنا أو <span className="text-gold-600">اضغط للتصفح</span>
              </p>
              <p className="text-xs text-navy-400 mt-1">
                {imageOnly ? `JPG, PNG, WebP • الحد الأقصى ${maxSize / 1024 / 1024}MB` : `JPG, PNG, WebP, PDF • الحد الأقصى ${maxSize / 1024 / 1024}MB`}
              </p>
            </div>
          </motion.div>
        </div>
      ) : (
        /* Preview - same design as before */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative border-2 border-emerald-200 rounded-2xl p-4 bg-emerald-50/30"
        >
          <div className="flex items-start gap-4">
            {/* Thumbnail */}
            {preview && previewUrl ? (
              <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-navy-100">
                <img
                  src={previewUrl}
                  alt={value.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 shrink-0 rounded-xl bg-navy-100 flex items-center justify-center">
                <FileText className="w-7 h-7 text-navy-400" />
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-navy-900 truncate">
                {value.name}
              </p>
              <p className="text-xs text-navy-500 mt-0.5">
                {value.type || "صورة"} • {formatFileSize(value.size)}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs text-emerald-600">تم رفع الصورة</span>
              </div>
            </div>

            {/* Remove */}
            <button
              type="button"
              onClick={handleRemove}
              className="shrink-0 w-8 h-8 rounded-lg bg-white border border-navy-200 flex items-center justify-center hover:border-red-300 hover:text-red-500 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Error - Arabic validation messages */}
      {displayError && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-500 flex items-center gap-1 mt-1"
        >
          <AlertTriangle className="w-3 h-3" />
          {displayError}
        </motion.p>
      )}
    </div>
  );
}
