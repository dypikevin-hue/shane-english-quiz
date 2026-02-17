import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Upload, Trash2, Download, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface FileManagerProps {
  studentType?: string;
}

export default function FileManager({ studentType }: FileManagerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  // 查詢用戶檔案
  const { data: files = [], refetch } = trpc.files.list.useQuery();

  // 上傳檔案
  const uploadMutation = trpc.files.upload.useMutation({
    onSuccess: () => {
      toast.success("檔案上傳成功！");
      setSelectedFile(null);
      setDescription("");
      refetch();
    },
    onError: (error) => {
      toast.error(`上傳失敗: ${error.message}`);
    },
  });

  // 刪除檔案
  const deleteMutation = trpc.files.delete.useMutation({
    onSuccess: () => {
      toast.success("檔案已刪除");
      refetch();
    },
    onError: (error) => {
      toast.error(`刪除失敗: ${error.message}`);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("請選擇檔案");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = (event.target?.result as string).split(",")[1];
        await uploadMutation.mutateAsync({
          fileName: selectedFile.name,
          fileData: base64,
          mimeType: selectedFile.type,
          description: description || undefined,
        });
      };
      reader.readAsDataURL(selectedFile);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("zh-TW");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-blue-800 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* 上傳區域 */}
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader>
              <CardTitle className="text-white">上傳檔案</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center">
                <Input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-input"
                />
                <label
                  htmlFor="file-input"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-8 h-8 text-white/60" />
                  <span className="text-white">
                    {selectedFile ? selectedFile.name : "點擊選擇檔案或拖放"}
                  </span>
                  {selectedFile && (
                    <span className="text-sm text-white/60">
                      {formatFileSize(selectedFile.size)}
                    </span>
                  )}
                </label>
              </div>

              <Input
                placeholder="檔案描述（選填）"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />

              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                {uploading ? "上傳中..." : "上傳檔案"}
              </Button>
            </CardContent>
          </Card>

          {/* 檔案列表 */}
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardHeader>
              <CardTitle className="text-white">我的檔案 ({files.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {files.length === 0 ? (
                <p className="text-white/60 text-center py-8">還沒有上傳任何檔案</p>
              ) : (
                <div className="space-y-3">
                  {files.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-between p-4 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition-all"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="w-5 h-5 text-blue-300 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-medium truncate">
                            {file.fileName}
                          </p>
                          <div className="flex gap-2 text-xs text-white/60">
                            <span>{formatFileSize(file.fileSize)}</span>
                            <span>•</span>
                            <span>{formatDate(file.createdAt)}</span>
                          </div>
                          {file.description && (
                            <p className="text-xs text-white/50 mt-1">
                              {file.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(file.fileUrl, "_blank")}
                          className="text-blue-300 hover:bg-white/10"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            deleteMutation.mutate({ fileId: file.id })
                          }
                          disabled={deleteMutation.isPending}
                          className="text-red-300 hover:bg-white/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
