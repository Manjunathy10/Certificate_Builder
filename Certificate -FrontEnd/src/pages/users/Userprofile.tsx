import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import useAuthStore from "@/auth/store";
import apiClient from "@/config/apiClient";
import toast from "react-hot-toast";
import { Upload, ChevronRight, ChevronLeft } from "lucide-react";

interface FormData {
  // Step 1: Personal Info
  fullName: string;
  email: string;
  mobileNumber: string;
  dateOfBirth: string;

  // Step 2: Address
  address: string;
  deliveryAddress: string;
  state: string;
  district: string;
  city: string;
  pincode: string;

  // Step 3: Work Info
  identificationNumber: string;
  centerName: string;
  deliveryPartner: string;
  startDate: string;
  endDate: string;

  // Step 4: Photo
  profilePhoto: File | null;
  photoUrl: string;

  // Optional delivery location details for backend payload fallback logic
  deliveryCity: string;
  deliveryDistrict: string;
  deliveryState: string;
  deliveryPincode: string;
}

interface ExistingProfile {
  id?: string;
  fullName?: string;
  mobileNumber?: string;
  identificationNumber?: string;
  centerName?: string;
  deliveryPartner?: string;
  dateOfBirth?: string;
  startDate?: string;
  endDate?: string;
  photoUrl?: string;
}

interface ExistingAddress {
  addressLine?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  type?: string;
}

export default function ProfileOnboarding() {
  type ValidationField =
    | "fullName"
    | "mobileNumber"
    | "identificationNumber"
    | "dateOfBirth"
    | "pincode";

  const user = useAuthStore((state) => state.user);
  const authUser = user as (typeof user & {
    profile?: ExistingProfile;
    addresses?: ExistingAddress[];
  }) | null;

  const profileFromStore = authUser?.profile ?? null;
  const addresses = authUser?.addresses || [];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Partial<Record<ValidationField, string>>>({});
  const [localProfile, setLocalProfile] = useState<ExistingProfile | null>(
    profileFromStore
  );
  const [localAddresses, setLocalAddresses] = useState<ExistingAddress[]>(
    addresses
  );
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    mobileNumber: "",
    dateOfBirth: "",
    address: "",
    deliveryAddress: "",
    state: "",
    district: "",
    city: "",
    pincode: "",
    identificationNumber: "",
    centerName: "",
    deliveryPartner: "",
    startDate: "",
    endDate: "",
    profilePhoto: null,
    photoUrl: "",
    deliveryCity: "",
    deliveryDistrict: "",
    deliveryState: "",
    deliveryPincode: "",
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const existingProfile = localProfile ?? profileFromStore;
  const existingAddresses = addresses.length > 0 ? addresses : localAddresses;
  const hasProfile = Boolean(existingProfile);

  useEffect(() => {
    console.log("ADDRESSES:", addresses);
  }, [addresses]);

  const steps = [
    "Personal Info",
    "Address",
    "Work Info",
    "Upload Photo",
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name in errors) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const inputErrorClass = (field: ValidationField) =>
    errors[field]
      ? "border-red-500 focus:ring-red-500 dark:border-red-500"
      : "";

  const validate = () => {
    const newErrors: Partial<Record<ValidationField, string>> = {};
    const fullName = formData.fullName.trim();
    const mobileNumber = formData.mobileNumber.trim();
    const identificationNumber = formData.identificationNumber.trim();
    const dateOfBirth = formData.dateOfBirth.trim();
    const pincode = formData.pincode.trim();

    if (!fullName) {
      newErrors.fullName = "Full Name is required";
    }

    if (!mobileNumber) {
      newErrors.mobileNumber = "Mobile Number is required";
    } else if (!/^[0-9]{10}$/.test(mobileNumber)) {
      newErrors.mobileNumber = "Enter valid 10-digit number";
    }

    if (!identificationNumber) {
      newErrors.identificationNumber = "ID required";
    }

    if (!dateOfBirth) {
      newErrors.dateOfBirth = "Date of Birth required";
    }

    if (pincode && !/^[0-9]{6}$/.test(pincode)) {
      newErrors.pincode = "Invalid pincode";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatDateForInput = (value?: string) => {
    if (!value) return "";
    return value.slice(0, 10);
  };

  useEffect(() => {
    if (!isEditMode || !existingProfile) {
      return;
    }

    const permanent =
      existingAddresses.find((addr) => addr.type === "PERMANENT") ?? {};
    const delivery =
      existingAddresses.find((addr) => addr.type === "DELIVERY") ?? {};

    setFormData((prev) => ({
      ...prev,
      fullName: existingProfile.fullName || "",
      mobileNumber: existingProfile.mobileNumber || "",
      identificationNumber: existingProfile.identificationNumber || "",
      centerName: existingProfile.centerName || "",
      deliveryPartner: existingProfile.deliveryPartner || "",
      dateOfBirth: formatDateForInput(existingProfile.dateOfBirth),
      startDate: formatDateForInput(existingProfile.startDate),
      endDate: formatDateForInput(existingProfile.endDate),
      photoUrl: existingProfile.photoUrl || "",
      address: permanent.addressLine || "",
      city: permanent.city || "",
      district: permanent.district || "",
      state: permanent.state || "",
      pincode: permanent.pincode || "",
      deliveryAddress: delivery.addressLine || "",
      deliveryCity: delivery.city || "",
      deliveryDistrict: delivery.district || "",
      deliveryState: delivery.state || "",
      deliveryPincode: delivery.pincode || "",
    }));

    setPhotoPreview(existingProfile.photoUrl || null);
    setCurrentStep(1);
  }, [isEditMode, existingProfile, existingAddresses]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profilePhoto: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        setFormData((prev) => ({
          ...prev,
          photoUrl: result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(
          formData.fullName.trim() &&
          formData.email.trim() &&
          formData.mobileNumber.trim() &&
          formData.dateOfBirth.trim()
        );
      case 2:
        return !!(
          formData.address.trim() &&
          formData.state.trim() &&
          formData.city.trim() &&
          formData.pincode.trim()
        );
      case 3:
        return !!(
          formData.identificationNumber.trim() &&
          formData.centerName.trim() &&
          formData.startDate.trim()
        );
      case 4:
        return !!formData.profilePhoto;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep() && currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFinish = async () => {
    if (!validate()) {
      toast.error("Please fix highlighted errors");
      return;
    }

    if (!validateStep()) {
      toast.error("Please complete all required fields");
      return;
    }

    const persistedUserId = (() => {
      try {
        const raw = localStorage.getItem("app_state");
        if (!raw) return "";
        const parsed = JSON.parse(raw) as {
          state?: { user?: { id?: string } };
        };
        return parsed?.state?.user?.id || "";
      } catch {
        return "";
      }
    })();

    const userId = user?.id || persistedUserId;

    if (!userId) {
      toast.error("User session not found. Please login again.");
      return;
    }

    const toYyyyMmDd = (value: string) => {
      if (!value) return "";
      return value.slice(0, 10);
    };

    const safePhotoUrl = formData.photoUrl.startsWith("data:") ? "" : formData.photoUrl;

    const payload = {
      identificationNumber: formData.identificationNumber,
      nsdcEnrollmentEnabled: false,
      fullName: formData.fullName,
      mobileNumber: formData.mobileNumber,
      centerName: formData.centerName,
      deliveryPartner: formData.deliveryPartner,
      dateOfBirth: toYyyyMmDd(formData.dateOfBirth),
      startDate: toYyyyMmDd(formData.startDate),
      endDate: toYyyyMmDd(formData.endDate),
      photoUrl: safePhotoUrl,
      addresses: [
        {
          addressLine: formData.address,
          city: formData.city,
          district: formData.district,
          state: formData.state,
          pincode: formData.pincode,
          type: "PERMANENT",
        },
        {
          addressLine: formData.deliveryAddress,
          city: formData.deliveryCity || formData.city,
          district: formData.deliveryDistrict || formData.district,
          state: formData.deliveryState || formData.state,
          pincode: formData.deliveryPincode || formData.pincode,
          type: "DELIVERY",
        },
      ],
    };

    try {
      setIsSubmitting(true);
      console.log("FINAL PAYLOAD:", payload);

      if (existingProfile) {
        const updateId = existingProfile.id || userId;
        const updateResponse = await apiClient.put(`/profile/${updateId}`, payload);
        const updateData = updateResponse?.data as {
          id?: string;
          profile?: ExistingProfile;
          addresses?: ExistingAddress[];
        };

        setLocalProfile(
          updateData?.profile ?? {
            ...existingProfile,
            ...payload,
            id: updateData?.id || existingProfile.id,
          }
        );
        setLocalAddresses(
          Array.isArray(updateData?.addresses)
            ? updateData.addresses
            : (payload.addresses as ExistingAddress[])
        );
        toast.success("Profile saved successfully");
        setIsEditMode(false);
        return;
      }

      const createResponse = await apiClient.post(`/profile/${userId}`, payload);
      const createData = createResponse?.data as {
        id?: string;
        profile?: ExistingProfile;
        addresses?: ExistingAddress[];
      };

      setLocalProfile(
        createData?.profile ?? {
          ...payload,
          id: createData?.id,
        }
      );
      setLocalAddresses(
        Array.isArray(createData?.addresses)
          ? createData.addresses
          : (payload.addresses as ExistingAddress[])
      );
      toast.success("Profile saved successfully");
      setIsEditMode(false);
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response
          ?.data?.message === "string"
          ? (error as { response?: { data?: { message?: string } } }).response!
              .data!.message!
          : "Could not save profile. Please try again.";
      toast.error(message);
      console.error("Profile save failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (label: string, value?: string) => (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value && value.trim() ? value : "-"}</p>
    </div>
  );

  if (hasProfile && !isEditMode) {
    const profileView = existingProfile as ExistingProfile;
    const permanentAddress =
      existingAddresses.find((addr) => addr.type === "PERMANENT") ?? {};
    const deliveryAddress =
      existingAddresses.find((addr) => addr.type === "DELIVERY") ?? {};
    const avatarUrl =
      profileView.photoUrl && profileView.photoUrl.trim()
        ? profileView.photoUrl
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(
            profileView.fullName || "User"
          )}`;
    const permanentAddressText = [
      permanentAddress.addressLine,
      permanentAddress.city,
      permanentAddress.district,
      permanentAddress.state,
      permanentAddress.pincode,
    ]
      .filter((item) => Boolean(item && item.trim()))
      .join(", ");

    return (
      <div className="min-h-screen bg-background text-foreground transition-colors py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2">Your Profile</h1>
            <p className="text-muted-foreground">Review your profile details</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-border">
              <img
                src={avatarUrl}
                alt="Profile"
                className="h-16 w-16 rounded-full object-cover border border-border"
              />
              <div>
                <h2 className="text-xl font-semibold">
                  {profileView.fullName && profileView.fullName.trim()
                    ? profileView.fullName
                    : "-"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {profileView.mobileNumber && profileView.mobileNumber.trim()
                    ? profileView.mobileNumber
                    : "-"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Basic Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField("Identification Number", profileView.identificationNumber)}
                {renderField("Center Name", profileView.centerName)}
                {renderField("Delivery Partner", profileView.deliveryPartner)}
                {renderField("Date of Birth", formatDateForInput(profileView.dateOfBirth))}
                {renderField("Start Date", formatDateForInput(profileView.startDate))}
                {renderField("End Date", formatDateForInput(profileView.endDate))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Address Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField("Permanent Address", permanentAddressText)}
                {renderField("Delivery Address", deliveryAddress.addressLine)}
                {renderField("City", permanentAddress.city)}
                {renderField("District", permanentAddress.district)}
                {renderField("State", permanentAddress.state)}
                {renderField("Pincode", permanentAddress.pincode)}
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <Button onClick={() => setIsEditMode(true)}>Edit Profile</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Complete Your Profile</h1>
          <p className="text-muted-foreground">
            Set up your account in just a few steps
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {steps.map((_step, index) => (
              <div key={index} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                    index < currentStep
                      ? "bg-blue-600 text-white"
                      : index === currentStep - 1
                      ? "bg-blue-600 text-white ring-4 ring-blue-200 dark:ring-blue-900"
                      : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {index < currentStep - 1 ? "✓" : index + 1}
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 transition-all ${
                      index < currentStep - 1
                        ? "bg-blue-600"
                        : "bg-gray-200 dark:bg-gray-800"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between text-xs font-medium">
            {steps.map((step, index) => (
              <span
                key={index}
                className={`text-center flex-1 ${
                  index <= currentStep - 1
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {step}
              </span>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className={`w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${inputErrorClass("fullName")}`}
                />
                {errors.fullName ? (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.fullName}</p>
                ) : null}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email ID *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your mobile number"
                  className={`w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${inputErrorClass("mobileNumber")}`}
                />
                {errors.mobileNumber ? (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.mobileNumber}</p>
                ) : null}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${inputErrorClass("dateOfBirth")}`}
                />
                {errors.dateOfBirth ? (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.dateOfBirth}</p>
                ) : null}
              </div>
            </div>
          )}

          {/* Step 2: Address Information */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Address *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter your residential address"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Delivery Address
                </label>
                <textarea
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={handleInputChange}
                  placeholder="Enter delivery address (optional)"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Enter state"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    District
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    placeholder="Enter district"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter city"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="Enter pincode"
                    className={`w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${inputErrorClass("pincode")}`}
                  />
                  {errors.pincode ? (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.pincode}</p>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Work Information */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Identification Number *
                </label>
                <input
                  type="text"
                  name="identificationNumber"
                  value={formData.identificationNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your identification number"
                  className={`w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${inputErrorClass("identificationNumber")}`}
                />
                {errors.identificationNumber ? (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.identificationNumber}</p>
                ) : null}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Center Name *
                </label>
                <input
                  type="text"
                  name="centerName"
                  value={formData.centerName}
                  onChange={handleInputChange}
                  placeholder="Enter center name"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Delivery Partner
                </label>
                <input
                  type="text"
                  name="deliveryPartner"
                  value={formData.deliveryPartner}
                  onChange={handleInputChange}
                  placeholder="Enter delivery partner name (optional)"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Upload Photo */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <label className="block text-sm font-medium mb-4">
                  Upload Profile Photo *
                </label>

                {photoPreview ? (
                  <div className="space-y-4">
                    <div className="relative w-40 h-40 mx-auto">
                      <img
                        src={photoPreview}
                        alt="Profile preview"
                        className="w-full h-full object-cover rounded-xl border border-border"
                      />
                    </div>

                    <label className="block">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          document.getElementById("photo-input")?.click();
                        }}
                      >
                        <Upload size={18} className="mr-2" />
                        Change Photo
                      </Button>
                    </label>

                    <input
                      id="photo-input"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <label className="relative flex flex-col items-center justify-center w-full px-8 py-12 border-2 border-dashed border-border rounded-2xl hover:border-blue-500 transition cursor-pointer bg-background/50 hover:bg-background/80">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload size={32} className="mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-12 pt-8 border-t border-border">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ChevronLeft size={18} />
                Back
              </Button>
            )}

            {currentStep < steps.length ? (
              <Button
                onClick={handleNext}
                disabled={!validateStep()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
              >
                Next
                <ChevronRight size={18} />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                disabled={!validateStep() || isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {isSubmitting ? "Saving..." : "Finish"}
              </Button>
            )}
          </div>

          {/* Validation Message */}
          {!validateStep() && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-4 text-center">
              Please fill in all required fields
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
