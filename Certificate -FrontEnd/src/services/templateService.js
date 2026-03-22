import apiClient from "@/config/apiClient";

function normalizeAssetUrl(raw) {
  if (!raw) return "";
  if (typeof raw === "string") return raw;
  return raw.url || raw.path || raw.location || "";
}

const TEMPLATE_BASE = "/templates";
const CERTIFICATE_BASE = "/certificates";

function normalizeListPayload(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export async function getAllTemplates() {
  const res = await apiClient.get(TEMPLATE_BASE);
  return normalizeListPayload(res.data);
}

export async function getTemplateById(id) {
  const res = await apiClient.get(`${TEMPLATE_BASE}/${id}`);
  return res.data;
}

export async function createTemplate(data) {
  const res = await apiClient.post(TEMPLATE_BASE, data);
  return res.data;
}

export async function updateTemplate(id, data) {
  const res = await apiClient.put(`${TEMPLATE_BASE}/${id}`, data);
  return res.data;
}

export async function deleteTemplate(id) {
  const res = await apiClient.delete(`${TEMPLATE_BASE}/${id}`);
  return res.data;
}

export async function uploadAsset(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiClient.post(`${TEMPLATE_BASE}/assets/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const url = normalizeAssetUrl(res.data);
  return {
    url,
    raw: res.data,
  };
}

export async function generateCertificatePdf(studentId, templateId) {
  const res = await apiClient.get(`${CERTIFICATE_BASE}/generate`, {
    params: { studentId, templateId },
    responseType: "blob",
  });
  return res.data;
}

export async function getCertificateStudents() {
  const res = await apiClient.get("/students", {
    params: { page: 0, size: 200 },
  });
  const payload = res.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data?.content)) return payload.data.content;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

export async function verifyCertificate(certificateNumber) {
  const res = await apiClient.get(`${CERTIFICATE_BASE}/verify/${certificateNumber}`);
  return res.data;
}

const templateService = {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  uploadAsset,
  generateCertificatePdf,
  getCertificateStudents,
  verifyCertificate,
};

export default templateService;
