"use client";

import React, { useState, useEffect } from "react";
import { HardDrive, Upload, Search, Trash2, Download, Eye, FileText, Check, AlertCircle } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

interface UploadedFile {
  name: string;
  url: string;
  size: number;
  createdAt: string;
  type: string;
}

export default function FileManagerPage() {
  const user = useUIStore((state) => state.user);

  // States
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await fetch("/api/upload/list");
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
      }
    } catch (err) {
      console.error("Error fetching files list:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        setSuccessMsg("File uploaded successfully.");
        fetchFiles();
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setErrorMsg("Failed to upload file to storage.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMsg("Error uploading file.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileName: string) => {
    if (!confirm(`Are you sure you want to delete ${fileName}?`)) return;
    try {
      const res = await fetch(`/api/upload/list?name=${encodeURIComponent(fileName)}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setFiles(files.filter((f) => f.name !== fileName));
        setSuccessMsg("File deleted successfully.");
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setErrorMsg("Failed to delete file.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setErrorMsg("Error deleting file.");
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex justify-between items-center select-none">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-zinc-100 tracking-tight leading-tight">
            File Manager
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
            Upload, search, download, and manage digital form attachments hosted on S3 Cloudflare R2.
          </p>
        </div>

        <div>
          <input
            type="file"
            onChange={handleFileUpload}
            id="file-manager-upload"
            className="hidden"
            disabled={uploading}
          />
          <label
            htmlFor="file-manager-upload"
            className={cn(
              "flex items-center gap-2 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider px-4 py-3 shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-95 cursor-pointer duration-205 select-none",
              uploading && "opacity-50 pointer-events-none"
            )}
          >
            {uploading ? (
              <span className="h-4.5 w-4.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <Upload className="h-4.5 w-4.5" />
            )}
            <span>{uploading ? "Uploading..." : "Upload File"}</span>
          </label>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-250 text-xs font-semibold text-emerald-600 flex gap-2 items-center animate-fadeInDown">
          <Check className="h-4.5 w-4.5 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-250 text-xs font-semibold text-rose-600 flex gap-2 items-center animate-fadeInDown">
          <AlertCircle className="h-4.5 w-4.5 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Controls: Search */}
      <div className="flex select-none">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search uploaded files by name..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-card border border-border text-xs font-semibold outline-none focus:border-primary/50 text-slate-800 dark:text-zinc-200"
          />
        </div>
      </div>

      {/* Files Grid List */}
      <div className="crm-card bg-card border-border overflow-hidden">
        <div className="px-6 py-5 border-b border-border/50 flex justify-between items-center select-none">
          <h2 className="text-sm font-black text-slate-800 dark:text-zinc-200 uppercase tracking-widest">
            Storage Files
          </h2>
          <span className="text-[10px] font-extrabold text-slate-400">
            Total: {filteredFiles.length}
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-xs font-bold text-slate-400 flex flex-col gap-2 justify-center items-center">
            <div className="h-7 w-7 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <span>Reading storage bucket...</span>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="p-20 text-center select-none space-y-4">
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
              <HardDrive className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300">No Files Uploaded</h3>
              <p className="text-xs text-slate-400">When visitors upload file attachments during form submissions, they show up here.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/40 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none">
                  <th className="px-6 py-4">Preview / Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Size</th>
                  <th className="px-6 py-4">Uploaded At</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 text-xs font-semibold">
                {filteredFiles.map((file) => {
                  const dateStr = new Date(file.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                  });

                  return (
                    <tr key={file.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                      {/* Name & Icon/Thumbnail */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {file.type === "image" ? (
                            <img src={file.url} alt={file.name} className="h-10 w-10 object-cover rounded-lg border border-border/50 bg-slate-50" />
                          ) : (
                            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary border border-primary/20">
                              <FileText className="h-5 w-5" />
                            </div>
                          )}
                          <div className="max-w-[200px] md:max-w-[300px] truncate">
                            <div className="font-bold text-slate-800 dark:text-zinc-150 truncate">{file.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{file.url}</div>
                          </div>
                        </div>
                      </td>

                      {/* File Type */}
                      <td className="px-6 py-4">
                        <span className="capitalize px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 font-bold border border-border/40">
                          {file.type}
                        </span>
                      </td>

                      {/* File Size */}
                      <td className="px-6 py-4 text-slate-700 dark:text-zinc-300 font-mono font-bold">
                        {formatBytes(file.size)}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-slate-500 font-mono">
                        {dateStr}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right select-none">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-8 w-8 rounded-lg border border-border hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
                            title="Preview File"
                          >
                            <Eye className="h-4 w-4" />
                          </a>

                          <a
                            href={file.url}
                            download={file.name}
                            className="h-8 w-8 rounded-lg border border-border hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
                            title="Download File"
                          >
                            <Download className="h-4 w-4" />
                          </a>

                          <button
                            onClick={() => handleDeleteFile(file.name)}
                            className="h-8 w-8 rounded-lg border border-border hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center justify-center text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="Delete File"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
