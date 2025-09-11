import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, File, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect?: (file: File) => void;
  onUpload?: (file: File) => Promise<void>;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  disabled?: boolean;
}

interface UploadState {
  file: File | null;
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error?: string;
}

export const FileUpload = ({
  onFileSelect,
  onUpload,
  accept = "*",
  maxSize = 10,
  className,
  disabled = false
}: FileUploadProps) => {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    progress: 0,
    status: 'idle'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setUploadState({
        file: null,
        progress: 0,
        status: 'error',
        error: `File size must be less than ${maxSize}MB`
      });
      return;
    }

    setUploadState({
      file,
      progress: 0,
      status: 'idle'
    });

    onFileSelect?.(file);
  };

  const handleUpload = async () => {
    if (!uploadState.file || !onUpload) return;

    setUploadState(prev => ({ ...prev, status: 'uploading', progress: 0 }));

    try {
      // Simulate progress for demo purposes
      const progressInterval = setInterval(() => {
        setUploadState(prev => {
          const newProgress = Math.min(prev.progress + Math.random() * 15, 90);
          return { ...prev, progress: newProgress };
        });
      }, 200);

      await onUpload(uploadState.file);

      clearInterval(progressInterval);
      setUploadState(prev => ({ ...prev, status: 'success', progress: 100 }));

      // Reset after success
      setTimeout(() => {
        setUploadState({ file: null, progress: 0, status: 'idle' });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 2000);

    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Upload failed'
      }));
    }
  };

  const handleRemove = () => {
    setUploadState({ file: null, progress: 0, status: 'idle' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
    <div className={cn("space-y-4", className)}>
      {/* File Input */}
      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={disabled || uploadState.status === 'uploading'}
          className="hidden"
        />

        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploadState.status === 'uploading'}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Choose File
        </Button>

        {uploadState.file && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemove}
            disabled={uploadState.status === 'uploading'}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* File Preview */}
      {uploadState.file && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <File className="w-8 h-8 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {uploadState.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(uploadState.file.size)}
                </p>
              </div>

              {uploadState.status === 'success' && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}

              {uploadState.status === 'error' && (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
            </div>

            {/* Progress Bar */}
            {uploadState.status === 'uploading' && (
              <div className="mt-3">
                <Progress value={uploadState.progress} className="w-full" />
                <p className="text-xs text-muted-foreground mt-1">
                  Uploading... {Math.round(uploadState.progress)}%
                </p>
              </div>
            )}

            {/* Error Message */}
            {uploadState.status === 'error' && uploadState.error && (
              <p className="text-xs text-red-500 mt-2">
                {uploadState.error}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload Button */}
      {uploadState.file && uploadState.status === 'idle' && onUpload && (
        <Button
          onClick={handleUpload}
          disabled={disabled}
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload File
        </Button>
      )}
    </div>
  );
};

// Multiple File Upload Component
interface MultipleFileUploadProps extends Omit<FileUploadProps, 'onFileSelect' | 'onUpload'> {
  onFilesSelect?: (files: File[]) => void;
  onUploadAll?: (files: File[]) => Promise<void>;
  maxFiles?: number;
}

export const MultipleFileUpload = ({
  onFilesSelect,
  onUploadAll,
  maxFiles = 5,
  accept = "*",
  maxSize = 10,
  className,
  disabled = false
}: MultipleFileUploadProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadStates, setUploadStates] = useState<Record<string, UploadState>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Check file sizes
    const oversizedFiles = selectedFiles.filter(file => file.size > maxSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert(`Some files exceed the ${maxSize}MB limit`);
      return;
    }

    setFiles(selectedFiles);
    onFilesSelect?.(selectedFiles);

    // Initialize upload states
    const initialStates: Record<string, UploadState> = {};
    selectedFiles.forEach(file => {
      initialStates[file.name] = {
        file,
        progress: 0,
        status: 'idle'
      };
    });
    setUploadStates(initialStates);
  };

  const handleUploadAll = async () => {
    if (!onUploadAll || files.length === 0) return;

    // Set all files to uploading
    setUploadStates(prev => {
      const newStates = { ...prev };
      files.forEach(file => {
        newStates[file.name] = { ...newStates[file.name], status: 'uploading', progress: 0 };
      });
      return newStates;
    });

    try {
      await onUploadAll(files);

      // Set all to success
      setUploadStates(prev => {
        const newStates = { ...prev };
        files.forEach(file => {
          newStates[file.name] = { ...newStates[file.name], status: 'success', progress: 100 };
        });
        return newStates;
      });

      // Reset after success
      setTimeout(() => {
        setFiles([]);
        setUploadStates({});
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 3000);

    } catch (error) {
      setUploadStates(prev => {
        const newStates = { ...prev };
        files.forEach(file => {
          newStates[file.name] = {
            ...newStates[file.name],
            status: 'error',
            error: error instanceof Error ? error.message : 'Upload failed'
          };
        });
        return newStates;
      });
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
    <div className={cn("space-y-4", className)}>
      {/* File Input */}
      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple
          onChange={handleFilesSelect}
          disabled={disabled}
          className="hidden"
        />

        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Choose Files ({files.length}/{maxFiles})
        </Button>

        {files.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setFiles([]);
              setUploadStates({});
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              {files.map((file) => {
                const state = uploadStates[file.name];
                return (
                  <div key={file.name} className="flex items-center gap-3 p-3 border rounded">
                    <File className="w-6 h-6 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>

                      {state?.status === 'uploading' && (
                        <div className="mt-2">
                          <Progress value={state.progress} className="w-full h-1" />
                        </div>
                      )}

                      {state?.status === 'error' && state.error && (
                        <p className="text-xs text-red-500 mt-1">{state.error}</p>
                      )}
                    </div>

                    {state?.status === 'success' && (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}

                    {state?.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload All Button */}
      {files.length > 0 && onUploadAll && (
        <Button
          onClick={handleUploadAll}
          disabled={disabled || Object.values(uploadStates).some(state => state.status === 'uploading')}
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload All Files ({files.length})
        </Button>
      )}
    </div>
  );
};