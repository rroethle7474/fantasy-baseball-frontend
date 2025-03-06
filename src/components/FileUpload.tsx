import { useState, useRef, ChangeEvent } from 'react';

interface UploadResponse {
  success: boolean;
  message: string;
  fileName?: string;
  fileSize?: number;
}

interface FileUploadProps {
  title: string;
  description: string;
  onUpload: (file: File) => Promise<UploadResponse>;
  acceptedFileTypes?: string;
}

const FileUpload = ({ title, description, onUpload, acceptedFileTypes = '.csv,.xlsx,.xls' }: FileUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setUploadStatus({});
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus({
        success: false,
        message: 'Please select a file first'
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadStatus({});
      
      const result = await onUpload(selectedFile);
      
      setUploadStatus({
        success: true,
        message: result.message || 'File uploaded successfully!'
      });
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred during upload'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="card">
      <h2 className="card-title">{title}</h2>
      <p className="card-text">{description}</p>
      
      <div className="file-input-container !mt-8">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={acceptedFileTypes}
          className="hidden"
        />
        
        <button
          type="button"
          onClick={handleBrowseClick}
          className="file-selector-button button text-sm py-3 px-5 w-full md:w-auto"
          disabled={isUploading}
        >
          Browse Files
        </button>
        
        {selectedFile && (
          <div className="file-selection-display">
            <span className="file-name">
              {selectedFile.name}
            </span>
          </div>
        )}
        
        {!selectedFile && (
          <div className="file-selection-empty">
            <span className="text-gray-500 text-sm">No file selected</span>
          </div>
        )}
        
        <button
          type="button"
          onClick={handleUpload}
          className="button bg-green-600 hover:bg-green-700 text-sm py-3 px-5 w-full md:w-auto !mt-6"
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload File'}
        </button>
      </div>
      
      {uploadStatus.message && (
        <div className={`upload-status ${uploadStatus.success ? 'upload-status-success' : 'upload-status-error'}`}>
          {uploadStatus.message}
        </div>
      )}
    </div>
  );
};

export default FileUpload; 