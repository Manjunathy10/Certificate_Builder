import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Upload, ChevronRight, ChevronLeft } from "lucide-react";

interface FormData {
  // Step 1: Personal Info
  fullName: string;
  email: string;
  mobile: string;
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
}

export default function ProfileOnboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    mobile: "",
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
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

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
  };

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
        setPhotoPreview(reader.result as string);
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
          formData.mobile.trim() &&
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
    if (validateStep()) {
      // Here you would typically save the profile data to your backend
      console.log("Profile Data:", formData);

      // TODO: Call API to save profile
      // await saveProfile(formData);

      // Redirect to dashboard
      navigate("/dashboard");
    }
  };

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
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
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
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="Enter your mobile number"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
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
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
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
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
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
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
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
                disabled={!validateStep()}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                Finish
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
