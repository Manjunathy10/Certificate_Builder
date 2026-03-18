import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import toast, { Toaster } from "react-hot-toast";
import { getStudents, deleteStudent } from "@/services/StudentService";

type Student = {
  id?: string;
  studentId?: string;
  fullName: string;
  identificationNumber: string;
  courseName: string;
  status: string;
  email: string;
  mobileNumber: string;
};

// Highlights the matching part of a text string
function Highlight({ text, term }: { text: string; term: string }) {
  if (!term || !text) return <>{text || "-"}</>;
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded-sm bg-yellow-200 px-0 text-inherit dark:bg-yellow-700/70">
        {text.slice(idx, idx + term.length)}
      </mark>
      {text.slice(idx + term.length)}
    </>
  );
}

function StudentList() {
  const navigate = useNavigate();

  const [students, setStudents] = useState<Student[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const fetchStudents = async (currentPage: number, currentSize: number, currentSearch: string) => {
    try {
      setLoading(true);
      console.log("[StudentList] fetchStudents called with:", { currentPage, currentSize, currentSearch });
      const data = await getStudents(currentPage, currentSize, currentSearch);

      if (Array.isArray(data)) {
        setStudents(data);
        // If we received a full page, there may be more — allow Next.
        // If we received fewer than page size, this is the last page.
        const hasMore = data.length >= currentSize;
        setTotalPages(hasMore ? currentPage + 2 : currentPage + 1);
        setTotalElements(currentPage * currentSize + data.length);
        return;
      }

      const content: Student[] = data?.content || [];
      setStudents(content);
      // Prefer totalPages from backend; fall back to derivation
      if (data?.totalPages != null) {
        setTotalPages(data.totalPages);
      } else {
        const hasMore = content.length >= currentSize;
        setTotalPages(hasMore ? currentPage + 2 : currentPage + 1);
      }
      setTotalElements(data?.totalElements ?? currentPage * currentSize + content.length);
    } catch (error: any) {
      const message = error?.response?.data?.message;
      toast.error(message || "Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(page, size, search);
  }, [page, size, search]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setSearch(value);
      setPage(0);
    }, 350);
  };

  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    setPage(0);
  };

  const handleEdit = (student: Student) => {
    const id = student.id || student.studentId;
    navigate(`/dashboard/students/edit/${id}`);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id || deleteTarget.studentId;
    if (!id) {
      toast.error("Cannot delete: student ID not found");
      setDeleteTarget(null);
      return;
    }
    try {
      setDeleting(true);
      await deleteStudent(id);
      toast.success("Student deleted successfully");
      setDeleteTarget(null);
      fetchStudents(page, size, search);
    } catch (error: any) {
      const message = error?.response?.data?.message;
      toast.error(message || "Failed to delete student");
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "completed")
      return "inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400";
    if (s === "pursuing")
      return "inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    return "inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  };

  // Client-side: sort matched students to top, highlight works on searchInput (instant)
  const displayedStudents = useMemo(() => {
    const term = searchInput.trim().toLowerCase();
    if (!term) return students;
    const matches = (s: Student) =>
      (s.fullName || "").toLowerCase().includes(term) ||
      (s.identificationNumber || "").toLowerCase().includes(term) ||
      (s.email || "").toLowerCase().includes(term) ||
      (s.mobileNumber || "").toLowerCase().includes(term) ||
      (s.courseName || "").toLowerCase().includes(term);
    return [...students].sort((a, b) => (matches(a) ? 0 : 1) - (matches(b) ? 0 : 1));
  }, [students, searchInput]);

  const fromEntry = totalElements === 0 ? 0 : page * size + 1;
  const toEntry = Math.min((page + 1) * size, totalElements);

  return (
    <div className="p-6">
      <Toaster position="top-center" />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Student</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">{deleteTarget?.fullName}</span>?{" "}
            This action cannot be undone.
          </p>
          <DialogFooter className="mt-2 flex gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? <Spinner /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="mx-auto w-full shadow-lg">
        <CardContent className="p-6">

          {/* Header */}
          <div className="mb-6 border-b pb-4">
            <h2 className="text-2xl font-semibold">Student List</h2>
            <p className="text-sm text-muted-foreground">View, edit and manage all students</p>
          </div>

          {/* Toolbar */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show</span>
              <select
                value={size}
                onChange={(e) => handleSizeChange(Number(e.target.value))}
                disabled={loading}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              >
                {[10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <span className="text-sm text-muted-foreground">entries</span>
            </div>
            <Input
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name, ID, email..."
              disabled={loading}
              className="w-full sm:w-80"
            />
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex min-h-[220px] items-center justify-center">
              <Spinner />
            </div>
          ) : students.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border">
              <p className="text-sm font-medium text-muted-foreground">No students found</p>
              {search && (
                <p className="text-xs text-muted-foreground">Try a different search term</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full min-w-[1050px] text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">#</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Full Name</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">ID Number</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Course</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Status</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Email</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Mobile</th>
                    <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedStudents.map((student, index) => {
                    const id = student.id || student.studentId;
                    const term = searchInput.trim();
                    const isMatch =
                      term &&
                      (
                        (student.fullName || "").toLowerCase().includes(term.toLowerCase()) ||
                        (student.identificationNumber || "").toLowerCase().includes(term.toLowerCase()) ||
                        (student.email || "").toLowerCase().includes(term.toLowerCase()) ||
                        (student.mobileNumber || "").toLowerCase().includes(term.toLowerCase()) ||
                        (student.courseName || "").toLowerCase().includes(term.toLowerCase())
                      );
                    return (
                      <tr
                        key={id || `${student.identificationNumber}-${index}`}
                        className={`border-t border-border transition-colors hover:bg-muted/30 ${
                          isMatch ? "bg-yellow-50/60 dark:bg-yellow-900/10" : ""
                        }`}
                      >
                        <td className="px-4 py-3 text-muted-foreground">{page * size + index + 1}</td>
                        <td className="px-4 py-3 font-medium">
                          <Highlight text={student.fullName} term={term} />
                        </td>
                        <td className="px-4 py-3">
                          <Highlight text={student.identificationNumber} term={term} />
                        </td>
                        <td className="px-4 py-3">
                          <Highlight text={student.courseName} term={term} />
                        </td>
                        <td className="px-4 py-3">
                          <span className={getStatusBadge(student.status)}>
                            {student.status || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          <Highlight text={student.email} term={term} />
                        </td>
                        <td className="px-4 py-3">
                          <Highlight text={student.mobileNumber} term={term} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(student)}
                              disabled={loading || !id}
                              className="h-7 px-3 text-xs"
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeleteTarget(student)}
                              disabled={loading || !id}
                              className="h-7 px-3 text-xs"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer: entries info + pagination */}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {totalElements > 0
                ? `Showing ${fromEntry}–${toEntry} of ${totalElements} entries`
                : "No entries to show"}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                disabled={loading || page === 0}
              >
                Previous
              </Button>
              <span className="min-w-[90px] text-center text-sm text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={loading || page + 1 >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}

export default StudentList;
