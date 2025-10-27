'use client';

import { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter, 
  Button, 
  Input, 
  Label 
} from "@repo/ui";
import { 
  Building2, 
  Upload, 
  X, 
  FileText, 
  Link as LinkIcon,
  Briefcase,
  FileCheck
} from "lucide-react";

interface NewMeetingFormProps {
  onSubmit: (formData: {
    companyName: string;
    companyWebsite: string;
    roleToApply: string;
    requirements: string;
    resumeFile: File | null;
  }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  uploadProgress?: number;
  processingStatus?: string;
}

export function NewMeetingForm({ onSubmit, onCancel, isSubmitting = false, uploadProgress = 0, processingStatus = '' }: NewMeetingFormProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    companyWebsite: '',
    roleToApply: '',
    requirements: ''
  });
  
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file && file.type === 'application/pdf') {
        setResumeFile(file);
      } else {
        alert('Please upload a PDF file only.');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file && file.type === 'application/pdf') {
        setResumeFile(file);
      } else {
        alert('Please upload a PDF file only.');
      }
    }
  };

  const removeFile = () => {
    setResumeFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName.trim()) {
      alert('Company name is required');
      return;
    }
    
    if (!formData.roleToApply.trim()) {
      alert('Role to apply is required');
      return;
    }
    
    if (!formData.requirements.trim()) {
      alert('Job requirements are required');
      return;
    }
    
    if (!resumeFile) {
      alert('Resume PDF is required');
      return;
    }

    onSubmit({
      ...formData,
      resumeFile
    });
  };

  const isFormValid = formData.companyName.trim() && 
                     formData.roleToApply.trim() && 
                     formData.requirements.trim() && 
                     resumeFile;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Create New Interview Meeting</h2>
            <p className="text-muted-foreground mt-1">
              Set up your AI-powered interview session
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Company Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-lg font-semibold">
              <Building2 className="h-5 w-5" />
              <span>Company Information</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  placeholder="e.g., Google, Microsoft, Startup Inc."
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyWebsite">Company Website</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="companyWebsite"
                    type="url"
                    placeholder="https://company.com"
                    className="pl-10"
                    value={formData.companyWebsite}
                    onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Role Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-lg font-semibold">
              <Briefcase className="h-5 w-5" />
              <span>Role Information</span>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="roleToApply">Role to Apply *</Label>
              <Input
                id="roleToApply"
                placeholder="e.g., Senior Software Engineer, Product Manager"
                value={formData.roleToApply}
                onChange={(e) => handleInputChange('roleToApply', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="requirements">Job Requirements *</Label>
              <textarea
                id="requirements"
                className="w-full min-h-[120px] px-3 py-2 border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
                placeholder="Paste the job description or key requirements here..."
                value={formData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Include key skills, experience level, and specific requirements mentioned in the job posting
              </p>
            </div>
          </div>

          {/* Resume Upload */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-lg font-semibold">
              <FileText className="h-5 w-5" />
              <span>Resume Upload</span>
            </div>
            
            {!resumeFile ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
                onDrop={handleFileDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
              >
                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">Upload your resume</p>
                  <p className="text-sm text-muted-foreground">
                    Drag and drop your PDF file here, or click to browse
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="resume-upload"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => document.getElementById('resume-upload')?.click()}
                  >
                    Choose File
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    PDF files only, max 10MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="border rounded-lg p-4 bg-primary/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileCheck className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">{resumeFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={removeFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <div className="flex flex-col items-end space-y-2">
            {isSubmitting && processingStatus && (
              <div className="text-sm text-muted-foreground text-right">
                {processingStatus}
              </div>
            )}
            {isSubmitting && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-32 bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <span>{uploadProgress}%</span>
              </div>
            )}
            <Button 
              type="submit" 
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                uploadProgress > 0 && uploadProgress < 100 ? 'Uploading...' : 'Creating...'
              ) : 'Create Meeting'}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}