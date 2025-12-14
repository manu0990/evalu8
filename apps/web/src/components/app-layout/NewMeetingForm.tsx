'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardFooter, Button, Input, Textarea, Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui";
import { Building2, FileText, Link, Briefcase, FileCheck, Trash, Paperclip } from "lucide-react";
import { toast } from 'sonner';
import { getSignedUrl } from '@/actions/getSignedUrl';
import { createMeeting } from '@/actions/createMeeting';
import { deleteFromS3 } from '@/actions/deleteFromS3';
import axios, { AxiosProgressEvent } from 'axios';
import { cn } from '@/lib/utils';
import { newMeetingFormSchema, type newMeetingFormTypes } from '@/lib/validation/meeting';

function CircularProgress({ progress }: { progress: number }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <svg className="transform -rotate-90" width="56" height="56">
        <circle
          cx="28"
          cy="28"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          className="text-muted"
        />
        <circle
          cx="28"
          cy="28"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-primary transition-all duration-300"
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-xs font-semibold">{progress}%</span>
    </div>
  );
}

export function NewMeetingForm({ onCancel }: { onCancel: () => void }) {
  const router = useRouter();
  const form = useForm<newMeetingFormTypes>({
    resolver: zodResolver(newMeetingFormSchema),
    defaultValues: {
      companyName: '',
      companyWebsite: '',
      roleToApply: '',
      requirements: '',
      resume: { name: '', key: '', size: 0 }
    }
  });

  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const resume = form.watch("resume");
  const isFormValid = Boolean(resume.key && form.watch("companyName") && form.watch("roleToApply") && form.watch("requirements"));

  const resetUploadState = useCallback(() => {
    setUploading(false);
    setUploadProgress(0);
  }, []);

  const handleResumeUpload = useCallback(
    async (file: File) => {
      if (file.type !== 'application/pdf') return toast.warning("Only PDF files are allowed");
      if (file.size > 10 * 1024 * 1024) return toast.warning("File size must be under 10MB");

      form.setValue('resume', { name: file.name, size: file.size, key: '' });

      try {
        setUploading(true);

        const signed = await getSignedUrl(file.size);
        if (!signed.success || !signed.data) {
          toast.error(signed.error || "Failed to get upload URL");
          return resetUploadState();
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
          toast.error("Failed to upload resume");
          return resetUploadState();
        }

        form.setValue("resume.key", key);
        toast.success("Resume uploaded successfully");
      } catch (err) {
        console.error("Upload error:", err);
        toast.error("An error occurred during upload");
        form.setValue("resume", { name: '', size: 0, key: '' });
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    }, [form, resetUploadState]);

  const onFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleResumeUpload(file);
  }, [handleResumeUpload]);

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleResumeUpload(file);
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [handleResumeUpload]);

  const removeFile = async () => {
    const currentKey = resume.key;

    // Clear form immediately for better UX
    form.setValue("resume", { name: '', key: '', size: 0 });

    // Delete from S3 if there's a key
    if (currentKey) {
      const result = await deleteFromS3(currentKey);
      if (result.success) {
        toast.success("File removed");
      }
    }
  };

  const handleSubmit = async (data: newMeetingFormTypes) => {
    if (!data.resume.key) return toast.error("Resume is required");

    setIsSubmitting(true);
    try {
      const result = await createMeeting({
        companyName: data.companyName,
        companyWebsite: data.companyWebsite,
        roleToApply: data.roleToApply,
        requirements: data.requirements,
        resume: data.resume,
      });

      if (!result.success) {
        toast.error(result.error || "Failed to create meeting");
        return;
      }
      toast.success("Meeting created successfully!");

      // Navigate to meetings page
      router.push('/meetings');
    } catch (err) {
      console.error(err);
      toast.error("Failed to create meeting");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-6">
      <Card className="w-full max-w-2xl mx-auto border-accent">
        <CardHeader>
          <h2 className="text-2xl font-bold">Create New Meeting</h2>
          <p className="text-muted-foreground mt-1">Set up your AI-powered interview session</p>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <CardContent className="space-y-6">

              {/* Company Information */}
              <section className="space-y-4">
                <div className="flex items-center space-x-2 text-lg font-semibold">
                  <Building2 className="h-5 w-5" />
                  <span>Company Information</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="companyName"
                    rules={{ required: "Company name is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name <span className='text-destructive'>*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Google Inc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companyWebsite"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Website</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Link className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input type="url" placeholder="https://google.com" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              {/* Role Information */}
              <section className="space-y-4">
                <div className="flex items-center space-x-2 text-lg font-semibold">
                  <Briefcase className="h-5 w-5" />
                  <span>Role Information</span>
                </div>

                <FormField
                  control={form.control}
                  name="roleToApply"
                  rules={{ required: "Role is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role to Apply <span className='text-destructive'>*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Senior Software Engineer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requirements"
                  rules={{ required: "Requirements are required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Requirements <span className='text-destructive'>*</span></FormLabel>
                      <FormControl>
                        <Textarea placeholder="Paste job description & requirements..." className="min-h-28 max-h-28" {...field} />
                      </FormControl>
                      <FormDescription>
                        Include skills, experience level, and special requirements
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              {/* Resume Upload */}
              <section className="space-y-4">
                <div className="flex items-center space-x-2 text-lg font-semibold">
                  <FileText className="h-5 w-5" />
                  <span>Resume <span className='text-destructive'>*</span></span>
                </div>

                <Input type="file" accept="application/pdf" className="hidden" id="resume-input" onChange={onFileSelect} />

                {!resume.name ? (
                  /* Upload Button / Drag-and-Drop Area */
                  <div
                    className={cn(
                      "border-2 border-dashed border-accent rounded-lg transition-colors",
                      "p-3 md:p-8 text-center",
                      dragActive && "border-primary bg-primary/5"
                    )}
                    onDrop={onFileDrop}
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                  >
                    <div className="flex md:items-center md:justify-center md:gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("resume-input")?.click()}
                        disabled={isUploading}
                        className="h-10 md:h-12 w-full md:w-40 rounded-full cursor-pointer"
                      >
                        <Paperclip className="h-4 w-4 mr-2" />
                        Upload File
                      </Button>
                      <span className="hidden md:inline text-muted-foreground">or drag and drop here</span>
                    </div>
                  </div>
                ) : (
                  /* File Display - Uploading or Uploaded */
                  <div className={cn(
                    "border rounded-lg bg-card",
                    resume.key ? "border-accent p-4" : "border-accent p-3 md:p-4"
                  )}>
                    <div className="flex items-center gap-3 md:gap-4">
                      {isUploading ? (
                        <CircularProgress progress={uploadProgress} />
                      ) : resume.key ? (
                        <Paperclip className="h-5 w-5 md:h-5 md:w-5 text-primary shrink-0" />
                      ) : (
                        <FileCheck className="h-8 w-8 md:h-10 md:w-10 text-primary shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{resume.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(resume.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      {!isUploading && (
                        <Button
                          variant="ghost"
                          size={resume.key ? "icon-lg" : "icon"}
                          onClick={removeFile}
                          className={cn(
                            "cursor-pointer rounded-full shrink-0",
                            resume.key && "h-12 w-12 text-destructive hover:bg-primary hover:text-white transition"
                          )}
                        >
                          <Trash className={cn("h-4 w-4", resume.key && "h-5 w-5")} />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </section>

            </CardContent>

            <CardFooter className="flex flex-col gap-4 mt-8">
              <div className="flex justify-between w-full">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={onCancel}
                  disabled={isSubmitting || isUploading}
                  className='cursor-pointer'
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={!isFormValid || isSubmitting || isUploading}
                  className='cursor-pointer'
                >
                  {isSubmitting ? "Processing..." : "Create Meeting"}
                </Button>
              </div>
            </CardFooter>

          </form>
        </Form>
      </Card>
    </div>
  );
}
