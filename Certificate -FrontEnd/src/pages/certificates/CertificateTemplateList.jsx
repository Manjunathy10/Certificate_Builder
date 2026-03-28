import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { deleteTemplate, getAllTemplates, getCertificateStudents } from "../../services/templateService";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";

function getTokenFromLocalStorage() {
  try {
    const raw = localStorage.getItem("app_state");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const token = parsed?.state?.accessToken;
    return typeof token === "string" && token.trim() ? token : null;
  } catch {
    return null;
  }
}

async function generateCertificate(student, template) {
  const token = getTokenFromLocalStorage();
  const url = `${API_BASE}/certificates/generate?studentId=${encodeURIComponent(student.id)}&templateId=${encodeURIComponent(template.id)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to generate certificate");
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = `${String(student.fullName || "student").replace(/\s+/g, "_")}_Certificate.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
}

export default function CertificateTemplateList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [templates, setTemplates] = useState([]);
  const [students, setStudents] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  const loadTemplates = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const data = await getAllTemplates();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to load templates";
      setErrorMessage(message);
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const data = await getCertificateStudents();
        setStudents(Array.isArray(data) ? data : []);
      } catch {
        setStudents([]);
      }
    };

    loadStudents();
  }, []);

  const handleGenerateClick = async () => {
    if (!selectedStudentId) {
      toast.error("Please select a student");
      return;
    }

    if (!selectedTemplateId) {
      toast.error("Please select a template");
      return;
    }

    const student = students.find((item) => String(item.id || item.studentId || item._id || "") === selectedStudentId);
    const template = templates.find((item) => String(item.id || item._id || "") === selectedTemplateId);

    if (!student || !template) {
      toast.error("Invalid student or template selection");
      return;
    }

    setIsGenerating(true);
    try {
      await generateCertificate(
        {
          id: String(student.id || student.studentId || student._id || ""),
          fullName: student.fullName || student.name || student.studentName || "student",
        },
        {
          id: String(template.id || template._id || ""),
        }
      );
      toast.success("Certificate downloaded");
    } catch {
      toast.error("Failed to generate certificate");
    } finally {
      setIsGenerating(false);
    }
  };

  const confirmDelete = async () => {
    const id = deleteTarget;
    if (!id) return;

    setIsDeleting(true);
    try {
      await deleteTemplate(id);
      toast.success("Template deleted");
      setDeleteTarget(null);
      await loadTemplates();
    } catch {
      toast.error("Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Certificate Templates</h1>
        <button
          type="button"
          onClick={() => navigate("/dashboard/certificates/builder")}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Add New
        </button>
      </div>

  {loading ? (
    <div className="flex items-center gap-2 text-sm text-slate-600">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
      <span>Loading templates...</span>
    </div>
  ) : null}
  {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
  {!loading && !templates.length ? <p className="text-sm text-slate-500">No templates found.</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => {
          const templateId = template.id || template._id;
          const title = template.name || template.templateName || "Untitled";
          const backgroundUrl = template.backgroundUrl || template.backgroundImage;

          return (
            <div key={templateId} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="h-40 w-full bg-slate-100">
                {backgroundUrl ? (
                  <img src={backgroundUrl} alt={title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">No background</div>
                )}
              </div>
              <div className="space-y-3 p-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
                  <p className="text-xs text-slate-500">{template.orientation || "landscape"}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/dashboard/certificates/builder/${templateId}`)}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(templateId)}
                    className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Generate Certificate</h2>
            <p className="text-sm text-slate-500">Select a student and a template, then download the certificate PDF.</p>
          </div>

          <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
            <select
              value={selectedTemplateId}
              onChange={(event) => setSelectedTemplateId(event.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700"
            >
              <option value="">Select template</option>
              {templates.map((template) => {
                const templateId = String(template.id || template._id || "");
                const templateName = template.templateName || template.name || "Untitled";
                return (
                  <option key={templateId} value={templateId}>
                    {templateName}
                  </option>
                );
              })}
            </select>

            <button
              type="button"
              onClick={handleGenerateClick}
              disabled={isGenerating || !selectedStudentId || !selectedTemplateId}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-emerald-200 border-t-white" /> : null}
              {isGenerating ? "Generating..." : "Generate Certificate"}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-md border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Select</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Student Name</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Enrollment</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">Course</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {students.length ? (
                students.map((student) => {
                  const studentId = String(student.id || student.studentId || student._id || "");
                  const studentName = student.fullName || student.name || student.studentName || "N/A";
                  const enrollmentNo = student.enrollmentNo || student.registrationNo || "-";
                  const courseName = student.courseName || student.course || "-";

                  return (
                    <tr key={studentId} className="hover:bg-slate-50">
                      <td className="px-3 py-2">
                        <input
                          type="radio"
                          name="selectedStudent"
                          value={studentId}
                          checked={selectedStudentId === studentId}
                          onChange={(event) => setSelectedStudentId(event.target.value)}
                        />
                      </td>
                      <td className="px-3 py-2 text-slate-700">{studentName}</td>
                      <td className="px-3 py-2 text-slate-600">{enrollmentNo}</td>
                      <td className="px-3 py-2 text-slate-600">{courseName}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="px-3 py-4 text-center text-slate-500" colSpan={4}>
                    No students available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/45 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900">Delete Template</h3>
            <p className="mt-2 text-sm text-slate-600">Are you sure you want to delete this template?</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {isDeleting ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-white" /> : null}
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
