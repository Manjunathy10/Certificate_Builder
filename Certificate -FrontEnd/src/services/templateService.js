import apiClient from "@/config/apiClient";

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
  const config = data instanceof FormData ? { headers: { "Content-Type": undefined } } : undefined;
  const res = await apiClient.post(TEMPLATE_BASE, data, config);
  return res.data;
}

function normalizePositionPatchElements(elements) {
  return (Array.isArray(elements) ? elements : [])
    .filter((element) => element?.id)
    .map((element) => ({
      id: element.id,
      xPosition: Number(element.xPosition ?? element.x ?? element.xposition ?? 0),
      yPosition: Number(element.yPosition ?? element.y ?? element.yposition ?? 0),
    }));
}

export async function patchTemplateElements(id, elements) {
  const payload = {
    elements: normalizePositionPatchElements(elements),
  };
  const res = await apiClient.patch(`${TEMPLATE_BASE}/${id}`, payload);
  return res.data;
}

export async function updateTemplate(id, data) {
  return patchTemplateElements(id, data?.elements ?? data);
}

export async function deleteTemplate(id) {
  const res = await apiClient.delete(`${TEMPLATE_BASE}/${id}`);
  return res.data;
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
  patchTemplateElements,
  updateTemplate,
  deleteTemplate,
  generateCertificatePdf,
  getCertificateStudents,
  verifyCertificate,
};

export default templateService;
