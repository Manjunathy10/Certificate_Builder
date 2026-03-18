import { useEffect, useState, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import toast, { Toaster } from "react-hot-toast";
import {
  getStudentById,
  updateStudent,
  type AddStudentPayload,
} from "@/services/StudentService";

function EditStudent() {
  type RequiredField = "fullName" | "identificationNumber" | "email" | "mobileNumber";

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<AddStudentPayload>({
    enrollmentNo: "",
    identificationNumber: "",
    fullName: "",
    courseName: "",
    status: "",
    dateOfBirth: "",
    completionDate: "",
    email: "",
    mobileNumber: "",
    address: "",
    state: "",
    district: "",
    city: "",
    pincode: "",
    photoUrl: "",
  });

  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<RequiredField, string>>>({});

  const getErrorMessage = (error: any) => {
    const responseData = error?.response?.data;
    if (typeof responseData?.message === "string" && responseData.message.trim()) {
      return responseData.message;
    }
    if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
      const firstError = responseData.errors[0];
      if (typeof firstError === "string") return firstError;
      if (typeof firstError?.message === "string") return firstError.message;
    }
    if (typeof error?.message === "string" && error.message.trim()) {
      return error.message;
    }
    return "Failed to update student";
  };

  // Normalize date string to yyyy-MM-dd for date input
  const toDateInput = (val: string) => {
    if (!val) return "";
    // already yyyy-MM-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    const d = new Date(val);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  };

  useEffect(() => {
    if (!id) {
      toast.error("Invalid student ID");
      navigate("/dashboard/students/list");
      return;
    }
    const loadStudent = async () => {
      try {
        setLoadingData(true);
        const student = await getStudentById(id);
        setData({
          enrollmentNo: student.enrollmentNo || "",
          identificationNumber: student.identificationNumber || "",
          fullName: student.fullName || "",
          courseName: student.courseName || "",
          status: student.status || "",
          dateOfBirth: toDateInput(student.dateOfBirth),
          completionDate: toDateInput(student.completionDate),
          email: student.email || "",
          mobileNumber: student.mobileNumber || "",
          address: student.address || "",
          state: student.state || "",
          district: student.district || "",
          city: student.city || "",
          pincode: student.pincode || "",
          photoUrl: student.photoUrl || "",
        });
      } catch (error: any) {
        const message = error?.response?.data?.message;
        toast.error(message || "Failed to load student data");
        navigate("/dashboard/students/list");
      } finally {
        setLoadingData(false);
      }
    };
    loadStudent();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
    if (name in errors) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const inputErrorClass = (field: RequiredField) =>
    errors[field]
      ? "border-red-500 focus-visible:ring-red-500 dark:border-red-500"
      : "";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting || !id) return;

    const payload: AddStudentPayload = {
      ...data,
      enrollmentNo: data.enrollmentNo.trim(),
      identificationNumber: data.identificationNumber.trim(),
      fullName: data.fullName.trim(),
      courseName: data.courseName.trim(),
      status: data.status.trim(),
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().slice(0, 10) : "",
      completionDate: data.completionDate
        ? new Date(data.completionDate).toISOString().slice(0, 10)
        : "",
      email: data.email.trim(),
      mobileNumber: data.mobileNumber.trim(),
      address: data.address.trim(),
      state: data.state.trim(),
      district: data.district.trim(),
      city: data.city.trim(),
      pincode: data.pincode.trim(),
      photoUrl: data.photoUrl.trim(),
    };

    const nextErrors: Partial<Record<RequiredField, string>> = {};

    if (!payload.fullName) nextErrors.fullName = "Full Name is required";
    if (!payload.identificationNumber) nextErrors.identificationNumber = "Identification Number is required";
    if (!payload.email) nextErrors.email = "Email is required";
    if (!payload.mobileNumber) nextErrors.mobileNumber = "Mobile Number is required";

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (payload.email && !emailPattern.test(payload.email)) {
      nextErrors.email = "Please enter a valid email";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});

    try {
      setSubmitting(true);
      await updateStudent(id, payload);
      toast.success("Student updated successfully ✅");
      navigate("/dashboard/students/list");
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-6">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Toaster position="top-center" />

      <Card className="mx-auto max-w-6xl shadow-lg">
        <CardContent className="p-6">

          {/* Header */}
          <div className="mb-6 border-b pb-3">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate("/dashboard/students/list")}
              >
                ← Back
              </Button>
              <div>
                <h2 className="text-2xl font-semibold">Edit Student</h2>
                <p className="text-sm text-muted-foreground">Update student details</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Basic Info */}
            <div>
              <h3 className="mb-4 text-lg font-medium">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">

                <div>
                  <Label>Enrollment No</Label>
                  <Input name="enrollmentNo" value={data.enrollmentNo} onChange={handleChange} />
                </div>

                <div>
                  <Label>Identification Number *</Label>
                  <Input
                    name="identificationNumber"
                    value={data.identificationNumber}
                    onChange={handleChange}
                    className={inputErrorClass("identificationNumber")}
                  />
                  {errors.identificationNumber && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.identificationNumber}</p>
                  )}
                </div>

                <div className="col-span-2">
                  <Label>Full Name *</Label>
                  <Input
                    name="fullName"
                    value={data.fullName}
                    onChange={handleChange}
                    className={inputErrorClass("fullName")}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <Label>Course Name</Label>
                  <Input name="courseName" value={data.courseName} onChange={handleChange} />
                </div>

                <div>
                  <Label>Status</Label>
                  <Input
                    name="status"
                    placeholder="Pursuing / Completed"
                    value={data.status}
                    onChange={handleChange}
                  />
                </div>

              </div>
            </div>

            {/* Dates & Contact */}
            <div>
              <h3 className="mb-4 text-lg font-medium">Dates & Contact</h3>
              <div className="grid grid-cols-2 gap-4">

                <div>
                  <Label>Date Of Birth</Label>
                  <Input type="date" name="dateOfBirth" value={data.dateOfBirth} onChange={handleChange} />
                </div>

                <div>
                  <Label>Completion Date</Label>
                  <Input type="date" name="completionDate" value={data.completionDate} onChange={handleChange} />
                </div>

                <div>
                  <Label>Email *</Label>
                  <Input
                    name="email"
                    value={data.email}
                    onChange={handleChange}
                    className={inputErrorClass("email")}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Label>Mobile Number *</Label>
                  <Input
                    name="mobileNumber"
                    value={data.mobileNumber}
                    onChange={handleChange}
                    className={inputErrorClass("mobileNumber")}
                  />
                  {errors.mobileNumber && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.mobileNumber}</p>
                  )}
                </div>

              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="mb-4 text-lg font-medium">Address</h3>
              <div className="grid grid-cols-2 gap-4">

                <div className="col-span-2">
                  <Label>Address</Label>
                  <Input name="address" value={data.address} onChange={handleChange} />
                </div>

                <div>
                  <Label>State</Label>
                  <Input name="state" value={data.state} onChange={handleChange} />
                </div>

                <div>
                  <Label>District</Label>
                  <Input name="district" value={data.district} onChange={handleChange} />
                </div>

                <div>
                  <Label>City</Label>
                  <Input name="city" value={data.city} onChange={handleChange} />
                </div>

                <div>
                  <Label>Pincode</Label>
                  <Input name="pincode" value={data.pincode} onChange={handleChange} />
                </div>

              </div>
            </div>

            {/* Photo preview (read-only) */}
            {data.photoUrl && (
              <div>
                <Label>Current Photo</Label>
                <div className="mt-2 h-28 w-28 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                  <img src={data.photoUrl} alt="Student" className="h-full w-full object-cover" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  To change the photo, use Add Student and re-upload.
                </p>
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard/students/list")}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Spinner /> : "Save Changes"}
              </Button>
            </div>

          </form>

        </CardContent>
      </Card>
    </div>
  );
}

export default EditStudent;
