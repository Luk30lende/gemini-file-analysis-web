import { useRef, useState } from "react";
import { UploadCloud, FileText, X, CheckCircle2 } from "lucide-react";

function FileUpload({ selectedFile, onFileSelect }) {
  const fileInputRef = useRef(null);

  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const allowedExtensions = [".pdf", ".docx", ".txt", ".csv"];
  const maxFileSize = 20 * 1024 * 1024; // 20 MB

  // Validate and select a file
  const handleFile = (file) => {
    if (!file) return;

    const extension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      setError("Unsupported file type. Please upload PDF, DOCX, TXT or CSV.");
      onFileSelect(null);
      return;
    }

    if (file.size > maxFileSize) {
      setError("File is too large. Maximum allowed size is 20 MB.");
      onFileSelect(null);
      return;
    }

    if (file.size === 0) {
      setError("The selected file is empty.");
      onFileSelect(null);
      return;
    }

    setError("");
    onFileSelect(file);
  };

  // Handle file picker
  const handleFileChange = (event) => {
    handleFile(event.target.files[0]);
    event.target.value = "";
  };

  // Handle drag events
  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    handleFile(file);
  };

  // Remove selected file
  const removeFile = () => {
    onFileSelect(null);
    setError("");
  };

  // Format file size
  const formatFileSize = (size) => {
    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="file-upload-section">
      <div
        className={`upload-area ${isDragging ? "dragging" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-icon">
          <UploadCloud size={32} />
        </div>

        <h3>Upload your document</h3>

        <p>Drag and drop your file here, or browse your computer.</p>

        <button
          className="browse-btn"
          onClick={() => fileInputRef.current.click()}
          type="button"
        >
          Browse Files
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt,.csv"
          onChange={handleFileChange}
          hidden
        />

        <span className="supported-formats">
          Supported formats: PDF, DOCX, TXT, CSV
        </span>
      </div>

      {error && <div className="upload-error">{error}</div>}

      {selectedFile && (
        <div className="selected-file">
          <div className="selected-file-icon">
            <FileText size={22} />
          </div>

          <div className="selected-file-info">
            <span className="selected-file-name">{selectedFile.name}</span>

            <span className="selected-file-size">
              {formatFileSize(selectedFile.size)}
            </span>
          </div>

          <CheckCircle2 size={20} className="file-success-icon" />

          <button
            className="remove-file-btn"
            onClick={removeFile}
            type="button"
            aria-label="Remove selected file"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
