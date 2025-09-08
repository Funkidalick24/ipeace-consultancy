import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface TrainingFile {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimetype: string;
  isTrainingData: boolean;
  trainingEnabled: boolean;
  extractedText?: string;
  createdAt: string;
}

export default function AITrainingManager() {
  const { t } = useTranslation();
  const [trainingFiles, setTrainingFiles] = useState<TrainingFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTrainingFiles();
  }, []);

  const fetchTrainingFiles = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/training/files', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTrainingFiles(data.files || []);
      } else {
        setError('Failed to fetch training files');
      }
    } catch (error) {
      console.error('Error fetching training files:', error);
      setError('Failed to fetch training files');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only TXT, PDF, and DOCX files are supported for AI training');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/training/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Training file uploaded successfully!');
        fetchTrainingFiles(); // Refresh the list
      } else {
        setError(data.message || 'Failed to upload training file');
      }
    } catch (error) {
      console.error('Error uploading training file:', error);
      setError('Failed to upload training file');
    } finally {
      setUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const toggleTrainingStatus = async (fileId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/training/files/${fileId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ trainingEnabled: !currentStatus })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Training file ${!currentStatus ? 'enabled' : 'disabled'} successfully!`);
        fetchTrainingFiles(); // Refresh the list
      } else {
        setError(data.message || 'Failed to update training file status');
      }
    } catch (error) {
      console.error('Error updating training file status:', error);
      setError('Failed to update training file status');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeIcon = (mimetype: string) => {
    switch (mimetype) {
      case 'text/plain':
        return '📄';
      case 'application/pdf':
        return '📕';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return '📝';
      default:
        return '📎';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">Loading AI training files...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">AI Training Data Management</h2>
          <div className="flex items-center space-x-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf,.docx"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload Training File'}
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Upload TXT, PDF, or DOCX files to train the AI assistant with custom legal content.
        </p>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        {trainingFiles.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No training files uploaded yet.</p>
            <p className="text-sm text-gray-400 mt-2">
              Upload your first training file to enhance the AI assistant's knowledge.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {trainingFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getFileTypeIcon(file.mimetype)}</span>
                  <div>
                    <h3 className="font-medium">{file.originalName}</h3>
                    <p className="text-sm text-gray-600">
                      {formatFileSize(file.size)} • Uploaded {new Date(file.createdAt).toLocaleDateString()}
                    </p>
                    {file.extractedText && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ Text extracted successfully
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    file.trainingEnabled
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {file.trainingEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <button
                    onClick={() => toggleTrainingStatus(file.id, file.trainingEnabled)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      file.trainingEnabled
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {file.trainingEnabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}