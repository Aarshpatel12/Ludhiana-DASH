"use client";

import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';

export default function UploadDropzone() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const file = files[0];
    setFileName(file.name);
    setUploadStatus('uploading');
    
    // Simulate upload process
    setTimeout(() => {
      setUploadStatus('success');
      // Reset after 3 seconds
      setTimeout(() => {
        setUploadStatus('idle');
        setFileName(null);
      }, 3000);
    }, 1500);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="px-4 py-3">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileInput} 
        className="hidden" 
        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
      />
      <div 
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition-all
          ${isDragging ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800/50'}
        `}
      >
        {uploadStatus === 'idle' && (
          <>
            <UploadCloud className={`w-6 h-6 mb-2 ${isDragging ? 'text-blue-500' : 'text-slate-400'}`} />
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">
              Upload Reports
            </div>
            <div className="text-[10px] text-slate-500 text-center mt-1">
              Drag & drop or click
              <br/>PDF, IMG, DOC
            </div>
          </>
        )}

        {uploadStatus === 'uploading' && (
          <>
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 text-center truncate w-full px-2">
              Uploading...
            </div>
            <div className="text-[10px] text-slate-500 text-center mt-1 truncate w-full px-2">
              {fileName}
            </div>
          </>
        )}

        {uploadStatus === 'success' && (
          <>
            <CheckCircle className="w-6 h-6 mb-2 text-emerald-500" />
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 text-center">
              Uploaded
            </div>
            <div className="text-[10px] text-slate-500 text-center mt-1 truncate w-full px-2">
              {fileName}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
