import { authFetch } from './auth';

export interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimetype: string;
}

export async function uploadFile(file: File): Promise<UploadedFile> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await authFetch('/api/upload', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'File upload failed');
  }

  const data = await response.json();
  return data.file;
}

export async function uploadMultipleFiles(files: File[]): Promise<UploadedFile[]> {
  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append('files', file);
  });

  const response = await authFetch('/api/upload/multiple', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'File upload failed');
  }

  const data = await response.json();
  return data.files;
}

export async function getUserFiles(): Promise<UploadedFile[]> {
  const response = await authFetch('/api/files');

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get files');
  }

  const data = await response.json();
  return data.files;
}

export async function deleteFile(fileId: string): Promise<void> {
  const response = await authFetch(`/api/files/${fileId}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete file');
  }
}
