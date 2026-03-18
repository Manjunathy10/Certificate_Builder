import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import toast, { Toaster } from "react-hot-toast";
import { importStudents } from "@/services/StudentService";

function ImportStudent() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const allowedMimeTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    const fileName = selectedFile.name.toLowerCase();
    const hasAllowedExtension =
      fileName.endsWith(".csv") || fileName.endsWith(".xlsx") || fileName.endsWith(".xls");
    const hasAllowedMimeType = allowedMimeTypes.includes(selectedFile.type);

    if (!hasAllowedMimeType && !hasAllowedExtension) {
      setFile(null);
      toast.error("Only CSV or Excel file is allowed");
      e.target.value = "";
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please select a file");
      return;
    }

    try {
      setLoading(true);
      await importStudents(file);
      toast.success("File uploaded successfully");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      const message = error?.response?.data?.message;
      toast.error(message || "Failed to import students");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Toaster position="top-center" />

      <Card className="mx-auto max-w-3xl shadow-lg">
        <CardContent className="p-6">
          <div className="mb-6 border-b pb-3">
            <h2 className="text-2xl font-semibold">Import Students</h2>
            <p className="text-sm text-muted-foreground">
              Upload a CSV file to import student records
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label>Select CSV or Excel File</Label>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleFileChange}
                disabled={loading}
              />
              {file ? (
                <p className="mt-2 text-sm text-muted-foreground">Selected: {file.name}</p>
              ) : null}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner /> : "Upload File"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ImportStudent;
