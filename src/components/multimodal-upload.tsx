'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Upload, FileText, File, Paperclip } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  id: string;
  file: File;
  content?: string;
  type: 'txt' | 'json' | 'md' | 'csv' | 'other';
}

interface MultimodalUploadProps {
  onFilesChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
}

export function MultimodalUpload({ 
  onFilesChange, 
  maxFiles = 10, 
  maxSize = 10 
}: MultimodalUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getFileType = (file: File): UploadedFile['type'] => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'txt') return 'txt';
    if (extension === 'json') return 'json';
    if (extension === 'md') return 'md';
    if (extension === 'csv') return 'csv';
    return 'other';
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const handleFiles = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    
    // Check file count
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive",
      });
      return;
    }

    // Check file sizes
    const oversizedFiles = fileArray.filter(file => file.size > maxSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: "File too large",
        description: `Files must be smaller than ${maxSize}MB`,
        variant: "destructive",
      });
      return;
    }

    // Validate file types
    const allowedExtensions = ['txt', 'json', 'md', 'csv'];
    const invalidFiles = fileArray.filter(file => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      return !extension || !allowedExtensions.includes(extension);
    });

    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid file type",
        description: "Only TXT, JSON, MD, and CSV files are allowed",
        variant: "destructive",
      });
      return;
    }

    const newFiles: UploadedFile[] = [];
    
    for (const file of fileArray) {
      try {
        const fileType = getFileType(file);
        const content = await readFileContent(file);
        
        newFiles.push({
          id: `${Date.now()}-${Math.random()}`,
          file,
          content,
          type: fileType,
        });
      } catch (error) {
        toast({
          title: "Error reading file",
          description: `Failed to read ${file.name}`,
          variant: "destructive",
        });
      }
    }

    const updatedFiles = [...uploadedFiles, ...newFiles];
    setUploadedFiles(updatedFiles);
    onFilesChange(updatedFiles);
  }, [uploadedFiles, maxFiles, maxSize, onFilesChange, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const removeFile = useCallback((fileId: string) => {
    const updatedFiles = uploadedFiles.filter(file => file.id !== fileId);
    setUploadedFiles(updatedFiles);
    onFilesChange(updatedFiles);
  }, [uploadedFiles, onFilesChange]);

  const getFileIcon = (type: UploadedFile['type']) => {
    switch (type) {
      case 'txt':
        return <FileText className="h-4 w-4" />;
      case 'json':
        return <FileText className="h-4 w-4" />;
      case 'md':
        return <FileText className="h-4 w-4" />;
      case 'csv':
        return <FileText className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 backdrop-blur-sm ${
          isDragOver
            ? 'border-primary bg-primary/10 dark:bg-primary/5'
            : 'border-white/20 dark:border-white/10 bg-white/5 dark:bg-black/10 hover:border-white/30 dark:hover:border-white/20 hover:bg-white/10 dark:hover:bg-black/20'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="p-3 rounded-full bg-muted">
            <Paperclip className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">
              Drop files here or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-primary hover:underline"
              >
                browse
              </button>
            </p>
            <p className="text-xs text-muted-foreground">
              Supports TXT, JSON, MD, and CSV files up to {maxSize}MB
            </p>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".txt,.json,.md,.csv"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Attached Files</p>
            <Badge variant="secondary">
              {uploadedFiles.length}/{maxFiles}
            </Badge>
          </div>
          
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <Card key={file.id} className="p-3 bg-white/10 dark:bg-black/20 backdrop-blur-sm border-white/20 dark:border-white/10 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                    {getFileIcon(file.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.file.size)} • {file.type.toUpperCase()}
                    </p>
                    {file.content && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {file.content.substring(0, 50)}...
                      </p>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
