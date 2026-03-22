import apiClient from "@/config/apiClient";
import useAuth from "@/auth/store";

export type AddStudentPayload = {
  enrollmentNo: string;
  identificationNumber: string;
  fullName: string;
  courseName: string;
  status: string;
  dateOfBirth: string;
  completionDate: string;
  email: string;
  mobileNumber: string;
  address: string;
  state: string;
  district: string;
  city: string;
  pincode: string;
  photoUrl: string;
};

export const addStudent = async (data: AddStudentPayload) => {
  console.log("[addStudent] request payload:", data);
  console.log("[addStudent] auth token present:", Boolean(useAuth.getState().accessToken));
  try {
    const response = await apiClient.post("/students", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("[addStudent] API error status:", error?.response?.status);
    console.error("[addStudent] API error response:", error?.response?.data);
    throw error;
  }
};

export const importStudents = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post("/students/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const getStudents = async (page: number, size: number, search: string) => {
  const params: Record<string, unknown> = { page, size };
  if (search) params.search = search;

  console.log("[getStudents] request params:", params);

  const response = await apiClient.get("/students", { params });

  console.log("[getStudents] response data:", response.data);
  return response.data;
};

export const getStudentById = async (studentId: string) => {
  const response = await apiClient.get(`/students/${studentId}`);
  return response.data;
};

export const updateStudent = async (studentId: string, data: AddStudentPayload) => {
  const response = await apiClient.put(`/students/${studentId}`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const deleteStudent = async (studentId: string) => {
  const response = await apiClient.delete(`/students/${studentId}`);
  return response.data;
};