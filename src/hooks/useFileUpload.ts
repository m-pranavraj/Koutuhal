import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_DOC_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

type BucketName = "resumes" | "avatars" | "attachments";

interface UploadOptions {
  bucket: BucketName;
  path: string;
  allowedTypes?: string[];
  maxSize?: number;
  upsert?: boolean;
}

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const validateFile = (file: File, allowedTypes: string[], maxSize: number): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Allowed: ${allowedTypes.map(t => t.split("/")[1]).join(", ")}`;
    }
    if (file.size > maxSize) {
      return `File too large. Maximum size: ${(maxSize / 1024 / 1024).toFixed(0)}MB`;
    }
    return null;
  };

  const upload = async (file: File, options: UploadOptions): Promise<string | null> => {
    const allowedTypes = options.allowedTypes || [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES];
    const maxSize = options.maxSize || MAX_FILE_SIZE;

    const error = validateFile(file, allowedTypes, maxSize);
    if (error) {
      toast({ title: "Upload Error", description: error, variant: "destructive" });
      return null;
    }

    setUploading(true);
    setProgress(0);

    try {
      const { error: uploadError } = await supabase.storage
        .from(options.bucket)
        .upload(options.path, file, { upsert: options.upsert ?? true });

      if (uploadError) throw uploadError;

      setProgress(100);

      if (options.bucket === "avatars") {
        const { data } = supabase.storage.from(options.bucket).getPublicUrl(options.path);
        return data.publicUrl;
      }

      // For private buckets, return the path (use signed URLs to access)
      return options.path;
    } catch (err: any) {
      toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const getSignedUrl = async (bucket: BucketName, path: string, expiresIn = 3600): Promise<string | null> => {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
    if (error) {
      toast({ title: "Error", description: "Could not generate download link", variant: "destructive" });
      return null;
    }
    return data.signedUrl;
  };

  return { upload, uploading, progress, getSignedUrl, ALLOWED_IMAGE_TYPES, ALLOWED_DOC_TYPES };
};
