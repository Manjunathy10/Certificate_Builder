import { useState, type FormEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import toast, { Toaster } from "react-hot-toast";
import { addStudent, type AddStudentPayload } from "@/services/StudentService";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";

function AddStudent() {
  type RequiredField = "fullName" | "identificationNumber" | "email" | "mobileNumber";

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

  const [loading, setLoading] = useState(false);
  const [photoFileName, setPhotoFileName] = useState("");
  const [errors, setErrors] = useState<Partial<Record<RequiredField, string>>>({});
  const [isCropping, setIsCropping] = useState(false);
  const [imageToCrop, setImageToCrop] = useState("");
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const getErrorMessage = (error: any) => {
    const responseData = error?.response?.data;
    if (typeof responseData?.message === "string" && responseData.message.trim()) {
      return responseData.message;
    }
    if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
      const firstError = responseData.errors[0];
      if (typeof firstError === "string") {
        return firstError;
      }
      if (typeof firstError?.message === "string") {
        return firstError.message;
      }
    }
    if (typeof error?.message === "string" && error.message.trim()) {
      return error.message;
    }
    return "Failed to add student";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setData({
      ...data,
      [name]: value,
    });

    if (name in errors) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, or WEBP images are allowed");
      return;
    }

    if (file.size > maxSize) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setImageToCrop(result);
      setIsCropping(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setPhotoFileName(file.name);
    };
    reader.onerror = () => {
      toast.error("Unable to read selected photo");
    };
    reader.readAsDataURL(file);

    e.target.value = "";
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (err) => reject(err));
      image.src = url;
    });

  const getCroppedDataUrl = async (imageSrc: string, pixelCrop: Area): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Canvas context unavailable");
    }

    const size = 512;
    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(
      image,
      Math.round(pixelCrop.x),
      Math.round(pixelCrop.y),
      Math.round(pixelCrop.width),
      Math.round(pixelCrop.height),
      0,
      0,
      size,
      size
    );

    return canvas.toDataURL("image/jpeg", 0.9);
  };

  const handleApplyCrop = async () => {
    if (!croppedAreaPixels) {
      toast.error("Please adjust crop area");
      return;
    }

    try {
      const croppedDataUrl = await getCroppedDataUrl(imageToCrop, croppedAreaPixels);
      setData((prev) => ({
        ...prev,
        photoUrl: croppedDataUrl,
      }));
      setIsCropping(false);
      setImageToCrop("");
      toast.success("Photo cropped successfully");
    } catch {
      toast.error("Failed to crop image. Please try again.");
    }
  };

  const handleCancelCrop = () => {
    setIsCropping(false);
    setImageToCrop("");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const inputErrorClass = (field: RequiredField) =>
    errors[field]
      ? "border-red-500 focus-visible:ring-red-500 dark:border-red-500"
      : "";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    const payload: AddStudentPayload = {
      ...data,
      enrollmentNo: data.enrollmentNo.trim(),
      identificationNumber: data.identificationNumber.trim(),
      fullName: data.fullName.trim(),
      courseName: data.courseName.trim(),
      status: data.status.trim(),
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().slice(0, 10) : "",
      completionDate: data.completionDate ? new Date(data.completionDate).toISOString().slice(0, 10) : "",
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

    if (!payload.fullName) {
      nextErrors.fullName = "Full Name is required";
    }

    if (!payload.identificationNumber) {
      nextErrors.identificationNumber = "Identification Number is required";
    }

    if (!payload.email) {
      nextErrors.email = "Email is required";
    }

    if (!payload.mobileNumber) {
      nextErrors.mobileNumber = "Mobile Number is required";
    }

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
      setLoading(true);

      console.log("[AddStudent] submitting payload:", payload);

      await addStudent(payload);

      toast.success("Student Added Successfully ✅");

      // reset form
      setData({
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
      setPhotoFileName("");

    } catch (err: any) {
      console.error("[AddStudent] API error status:", err?.response?.status);
      console.error("[AddStudent] API error response:", err?.response?.data);
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Toaster position="top-center" />

      <Card className="max-w-6xl mx-auto shadow-lg">
        <CardContent className="p-6">

          {/* Header */}
          <div className="mb-6 border-b pb-3">
            <h2 className="text-2xl font-semibold">Add Student</h2>
            <p className="text-sm text-muted-foreground">
              Enter student details carefully
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-medium mb-4">Basic Information</h3>

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
                  {errors.identificationNumber ? (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.identificationNumber}</p>
                  ) : null}
                </div>

                <div className="col-span-2">
                  <Label>Full Name *</Label>
                  <Input
                    name="fullName"
                    value={data.fullName}
                    onChange={handleChange}
                    className={inputErrorClass("fullName")}
                  />
                  {errors.fullName ? (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.fullName}</p>
                  ) : null}
                </div>

                <div>
                  <Label>Course Name</Label>
                  <Input name="courseName" value={data.courseName} onChange={handleChange} />
                </div>

                <div>
                  <Label>Status</Label>
                  <Input name="status" placeholder="Pursuing / Completed" value={data.status} onChange={handleChange} />
                </div>

              </div>
            </div>

            {/* Dates & Contact */}
            <div>
              <h3 className="text-lg font-medium mb-4">Dates & Contact</h3>

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
                  <Label>Email</Label>
                  <Input
                    name="email"
                    value={data.email}
                    onChange={handleChange}
                    className={inputErrorClass("email")}
                  />
                  {errors.email ? (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email}</p>
                  ) : null}
                </div>

                <div>
                  <Label>Mobile Number</Label>
                  <Input
                    name="mobileNumber"
                    value={data.mobileNumber}
                    onChange={handleChange}
                    className={inputErrorClass("mobileNumber")}
                  />
                  {errors.mobileNumber ? (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.mobileNumber}</p>
                  ) : null}
                </div>

              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-lg font-medium mb-4">Address</h3>

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

            <div>
              <Label>Upload Photo From Device</Label>
              <Input type="file" accept="image/*" onChange={handlePhotoUpload} />
              <p className="mt-1 text-xs text-muted-foreground">Allowed: JPG, PNG, WEBP | Max size: 5MB | Crop required</p>
              {photoFileName ? (
                <p className="mt-1 text-xs text-muted-foreground">Selected: {photoFileName}</p>
              ) : null}
            </div>

            {isCropping && imageToCrop ? (
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <p className="mb-3 text-sm font-medium">Crop Photo</p>
                <div className="relative h-72 w-full overflow-hidden rounded-md bg-black/70">
                  <Cropper
                    image={imageToCrop}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="rect"
                    showGrid={true}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
                  />
                </div>

                <div className="mt-3">
                  <Label>Zoom</Label>
                  <Input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                  />
                </div>

                <div className="mt-4 flex gap-2">
                  <Button type="button" variant="outline" onClick={handleCancelCrop}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleApplyCrop}>
                    Apply Crop
                  </Button>
                </div>
              </div>
            ) : null}

            {data.photoUrl ? (
              <div>
                <Label>Photo Preview</Label>
                <div className="mt-2 h-28 w-28 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                  <img src={data.photoUrl} alt="Student preview" className="h-full w-full object-cover" />
                </div>
              </div>
            ) : null}

            {/* Submit */}
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner /> : "Add Student"}
              </Button>
            </div>

          </form>

        </CardContent>
      </Card>
    </div>
  );
}

export default AddStudent;