import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import axios, { AxiosProgressEvent } from 'axios';
import { getUploadSignedUrl } from '@/actions/getUploadSignedUrl';
import { createResumeRecord } from '@/actions/createResumeRecord';
import type { Resume } from '@repo/db';

interface UseResumeUploadReturn {
  isUploading: boolean;
  uploadProgress: number;
  uploadResume: (file: File) => Promise<Resume | null>;
}

export function useResumeUpload(): UseResumeUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const resetUploadState = useCallback(() => {
    setIsUploading(false);
    setUploadProgress(0);
  }, []);

  const uploadResume = useCallback(
    async (file: File): Promise<Resume | null> => {
      if (file.type !== 'application/pdf') {
        toast.warning("Only PDF files are allowed");
        return null;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.warning("File size must be under 10MB");
        return null;
      }


      try {
        setIsUploading(true);

        const signed = await getUploadSignedUrl({
          fileType: file.type,
          fileSize: file.size,
          purpose: 'resume',
        });
        
        if (!signed.success || !signed.data) {
          toast.error(signed.error || "Failed to get upload URL");
          resetUploadState();
          return null;
        }

        const { url, key } = signed.data;

        const uploadResponse = await axios.put(url, file, {
          headers: { 'Content-Type': 'application/pdf' },
          onUploadProgress: (e: AxiosProgressEvent) => {
            const total = e.total ?? file.size;
            setUploadProgress(Math.round((e.loaded / total) * 100));
          }
        });

        if (uploadResponse.status !== 200) {
          toast.error("Failed to upload resume to storage");
          resetUploadState();
          return null;
        }

        const recordRes = await createResumeRecord(file.name, key, file.size);
        if (!recordRes.success || !recordRes.data) {
          toast.error(recordRes.error || "Failed to save resume record");
          resetUploadState();
          return null;
        }

        toast.success("Resume uploaded successfully");
        return recordRes.data as Resume;
      } catch (err) {
        console.error("Upload error:", err);
        toast.error("An error occurred during upload");
        return null;
      } finally {
        resetUploadState();
      }
    }, [resetUploadState]);

  return { isUploading, uploadProgress, uploadResume };
}
