import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import useAuth from "@/auth/store";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Upload, ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";

interface ProfileFormData {
  fullName: string;
  email: string;
  mobile: string;
  dateOfBirth: string;
  address: string;
  deliveryAddress: string;
  state: string;
  district: string;
  city: string;
  pincode: string;
  identificationNumber: string;
  centerName: string;
  deliveryPartner: string;
  startDate: string;
  endDate: string;
  profilePhoto: File | null;
}

function Userprofile() {
  const navigate = useNavigate();
  const user = useAuth((state) => state.user);
  const [profileComplete, setProfileComplete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  
  // Crop state management
  const [isCropping, setIsCropping] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>("");
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: "",
    email: user?.email || "",
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

  // Image validation function
  const validateImage = (file: File): { valid: boolean; error?: string } => {
    const validTypes = ["image/jpeg", "image/png"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      return { valid: false, error: "Only JPG and PNG images are allowed" };
    }

    if (file.size > maxSize) {
      return { valid: false, error: "Image size must be less than 5MB" };
    }

    return { valid: true };
  };

  // Create cropped image blob from canvas
  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (err) => reject(err));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<string> => {
    try {
      const image = await createImage(imageSrc);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("No 2d context");

      // Ensure width and height are integers
      const width = Math.round(pixelCrop.width);
      const height = Math.round(pixelCrop.height);
      const x = Math.round(pixelCrop.x);
      const y = Math.round(pixelCrop.y);

      canvas.width = width;
      canvas.height = height;

      // Set white background for transparency
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // Draw the cropped portion of the image
      ctx.drawImage(
        image,
        x,
        y,
        width,
        height,
        0,
        0,
        width,
        height
      );

      return canvas.toDataURL("image/jpeg", 0.9);
    } catch (error) {
      console.error("Error cropping image:", error);
      throw new Error("Failed to crop image");
    }
  };

  // Check if profile is complete
  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setProfileComplete(true);
      setFormData(profile);
    }
  }, []);

  const steps = [
    { title: "Personal Info", icon: "👤" },
    { title: "Address", icon: "📍" },
    { title: "Work Info", icon: "💼" },
    { title: "Upload Photo", icon: "📷" },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateImage(file);
      
      if (!validation.valid) {
        setErrorMessage(validation.error || "Invalid image");
        return;
      }

      setErrorMessage("");
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
        setIsCropping(true);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancelCrop = () => {
    setIsCropping(false);
    setImageToCrop("");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setErrorMessage("");
  };

  const handleApplyCrop = async () => {
    if (!croppedArea) {
      setErrorMessage("Please adjust the crop area before applying");
      return;
    }

    try {
      setErrorMessage("");
      
      // Generate cropped image
      const croppedImage = await getCroppedImg(imageToCrop, croppedArea);
      
      if (!croppedImage) {
        throw new Error("Failed to generate cropped image");
      }

      // Update preview
      setPhotoPreview(croppedImage);

      // Convert base64 to File for storage
      const blob = await fetch(croppedImage).then((res) => res.blob());
      const croppedFile = new File([blob], "profile-photo.jpg", {
        type: "image/jpeg",
      });

      // Update form data
      setFormData((prev) => ({ ...prev, profilePhoto: croppedFile }));
      
      // Close crop interface
      setIsCropping(false);
      setImageToCrop("");
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } catch (error) {
      console.error("Crop error:", error);
      setErrorMessage("Failed to crop image. Please try again.");
    }
  };

  const validateStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(formData.fullName && formData.email && formData.mobile && formData.dateOfBirth);
      case 2:
        return !!(formData.address && formData.state && formData.city && formData.pincode);
      case 3:
        return !!(formData.identificationNumber && formData.centerName && formData.startDate && formData.endDate);
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
      // Save to localStorage (replace with API call when backend is ready)
      localStorage.setItem("userProfile", JSON.stringify(formData));
      setProfileComplete(true);
      // TODO: Call API to save profile data
      // Navigate to dashboard
      navigate("/dashboard");
    }
  };

  // ========== PROFILE COMPLETION FORM ==========
  if (!profileComplete) {
    return (
      <div className="w-full min-h-screen bg-background py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6 sm:mb-8 lg:mb-10"
          >
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3 leading-tight">Complete Your Profile</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Let's get you set up in just a few steps</p>
          </motion.div>

          {/* Progress Bar */}
          <Card className="mb-6 sm:mb-8 rounded-lg sm:rounded-xl shadow-sm border-border/50">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between mb-2">
                {steps.map((_step, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-1 sm:mb-2 transition-all text-xs sm:text-sm font-medium ${
                        index + 1 <= currentStep
                          ? "bg-blue-600 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index + 1 < currentStep ? "✓" : index + 1}
                    </div>
                    <span className="text-xs text-muted-foreground text-center leading-tight">{_step.title}</span>
                  </div>
                ))}
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Form Card */}
          <Card className="rounded-lg sm:rounded-xl shadow-md border-border/50 mb-6 sm:mb-8">
            <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
              <CardTitle className="text-xl sm:text-2xl font-semibold leading-tight">
                {steps[currentStep - 1].title}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4 sm:space-y-5"
                >
                  <div>
                    <Label htmlFor="fullName" className="text-xs sm:text-sm font-medium block mb-2">
                      Full Name *
                    </Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="w-full rounded-lg text-sm px-3 sm:px-4 py-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-xs sm:text-sm font-medium block mb-2">
                      Email (Read-only) *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      value={formData.email}
                      readOnly
                      className="w-full rounded-lg bg-muted text-sm px-3 sm:px-4 py-2 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mobile" className="text-xs sm:text-sm font-medium block mb-2">
                      Mobile Number *
                    </Label>
                    <Input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      placeholder="Enter your mobile number"
                      className="w-full rounded-lg text-sm px-3 sm:px-4 py-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth" className="text-xs sm:text-sm font-medium block mb-2">
                      Date of Birth *
                    </Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full rounded-lg text-sm px-3 sm:px-4 py-2"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 2: Address */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4 sm:space-y-5"
                >
                  <div>
                    <Label htmlFor="address" className="text-xs sm:text-sm font-medium block mb-2">
                      Address *
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter your address"
                      className="w-full rounded-lg text-sm px-3 sm:px-4 py-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deliveryAddress" className="text-xs sm:text-sm font-medium block mb-2">
                      Delivery Address
                    </Label>
                    <Input
                      id="deliveryAddress"
                      name="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={handleInputChange}
                      placeholder="Enter delivery address"
                      className="w-full rounded-lg text-sm px-3 sm:px-4 py-2"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <Label htmlFor="state" className="text-xs sm:text-sm font-medium block mb-2">
                        State *
                      </Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="Enter state"
                        className="w-full rounded-lg text-sm px-3 sm:px-4 py-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="district" className="text-xs sm:text-sm font-medium block mb-2">
                        District
                      </Label>
                      <Input
                        id="district"
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        placeholder="Enter district"
                        className="w-full rounded-lg text-sm px-3 sm:px-4 py-2"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <Label htmlFor="city" className="text-xs sm:text-sm font-medium block mb-2">
                        City *
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Enter city"
                        className="w-full rounded-lg text-sm px-3 sm:px-4 py-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pincode" className="text-xs sm:text-sm font-medium block mb-2">
                        Pincode *
                      </Label>
                      <Input
                        id="pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        placeholder="Enter pincode"
                        className="w-full rounded-lg text-sm px-3 sm:px-4 py-2"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Work Information */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4 sm:space-y-5"
                >
                  <div>
                    <Label htmlFor="identificationNumber" className="text-xs sm:text-sm font-medium block mb-2">
                      Identification Number *
                    </Label>
                    <Input
                      id="identificationNumber"
                      name="identificationNumber"
                      value={formData.identificationNumber}
                      onChange={handleInputChange}
                      placeholder="Enter identification number"
                      className="w-full rounded-lg text-sm px-3 sm:px-4 py-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="centerName" className="text-xs sm:text-sm font-medium block mb-2">
                      Center Name *
                    </Label>
                    <Input
                      id="centerName"
                      name="centerName"
                      value={formData.centerName}
                      onChange={handleInputChange}
                      placeholder="Enter center name"
                      className="w-full rounded-lg text-sm px-3 sm:px-4 py-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deliveryPartner" className="text-xs sm:text-sm font-medium block mb-2">
                      Delivery Partner
                    </Label>
                    <Input
                      id="deliveryPartner"
                      name="deliveryPartner"
                      value={formData.deliveryPartner}
                      onChange={handleInputChange}
                      placeholder="Enter delivery partner"
                      className="w-full rounded-lg text-sm px-3 sm:px-4 py-2"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <Label htmlFor="startDate" className="text-xs sm:text-sm font-medium block mb-2">
                        Start Date *
                      </Label>
                      <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        className="w-full rounded-lg text-sm px-3 sm:px-4 py-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate" className="text-xs sm:text-sm font-medium block mb-2">
                        End Date *
                      </Label>
                      <Input
                        id="endDate"
                        name="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        className="w-full rounded-lg text-sm px-3 sm:px-4 py-2"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Upload Photo */}
              {currentStep === 4 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Error Message */}
                  {errorMessage && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
                    </div>
                  )}

                  {/* Croping Interface */}
                  {isCropping && imageToCrop ? (
                    <div className="space-y-4">
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-semibold">Crop Your Photo</h3>
                        <p className="text-sm text-muted-foreground">
                          Adjust the image to your liking (1:1 ratio)
                        </p>
                      </div>

                      {/* Crop Editor */}
                      <div className="bg-muted rounded-lg overflow-hidden relative" style={{ height: "300px" }}>
                        <Cropper
                          image={imageToCrop}
                          crop={crop}
                          zoom={zoom}
                          aspect={1}
                          cropShape="round"
                          showGrid={false}
                          onCropChange={setCrop}
                          onCropAreaChange={setCroppedArea}
                          onZoomChange={setZoom}
                          objectFit="auto-cover"
                        />
                      </div>

                      {/* Zoom Controls */}
                      <div className="flex items-center gap-4">
                        <ZoomOut className="w-5 h-5 text-muted-foreground" />
                        <input
                          type="range"
                          min={1}
                          max={3}
                          step={0.1}
                          value={zoom}
                          onChange={(e) => setZoom(parseFloat(e.target.value))}
                          className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <ZoomIn className="w-5 h-5 text-muted-foreground" />
                      </div>

                      {/* Crop Actions */}
                      <div className="flex gap-3 pt-2">
                        <Button
                          variant="outline"
                          onClick={handleCancelCrop}
                          className="flex-1 rounded-lg"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleApplyCrop}
                          className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-700"
                        >
                          Apply Crop
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Label className="text-sm font-medium mb-4 block">
                        Upload Profile Photo *
                      </Label>

                      {/* Upload Area */}
                      {!photoPreview ? (
                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all duration-200">
                          <input
                            type="file"
                            accept="image/jpeg,image/png"
                            onChange={handlePhotoUpload}
                            className="hidden"
                            id="photoUpload"
                          />
                          <label htmlFor="photoUpload" className="cursor-pointer block">
                            <div className="space-y-2">
                              <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                              <p className="text-sm font-medium">Drag and drop your photo here</p>
                              <p className="text-xs text-muted-foreground">
                                JPG or PNG • Max 5MB • 1:1 ratio recommended
                              </p>
                            </div>
                          </label>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Cropped Preview */}
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-200 dark:border-blue-800 shadow-lg">
                              <img
                                src={photoPreview}
                                alt="Cropped preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <p className="text-sm text-muted-foreground">Your profile photo</p>
                          </div>

                          {/* Change Photo Button */}
                          <input
                            type="file"
                            accept="image/jpeg,image/png"
                            onChange={handlePhotoUpload}
                            className="hidden"
                            id="photoUploadChange"
                          />
                          <label htmlFor="photoUploadChange" className="block">
                            <Button
                              variant="outline"
                              className="w-full rounded-lg cursor-pointer"
                              asChild
                            >
                              <span>Change Photo</span>
                            </Button>
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="rounded-lg flex items-center justify-center gap-2 py-2 sm:py-3 text-sm sm:text-base px-4"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            {currentStep < steps.length ? (
              <Button
                onClick={handleNext}
                disabled={!validateStep()}
                className="rounded-lg flex-1 sm:flex-1 flex items-center justify-center gap-2 py-2 sm:py-3 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 font-medium"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                disabled={!validateStep()}
                className="rounded-lg flex-1 sm:flex-1 py-2 sm:py-3 text-sm sm:text-base bg-green-600 hover:bg-green-700 font-medium"
              >
                Complete Profile
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ========== PROFILE VIEW PAGE ==========
  return (
    <div className="w-full min-h-screen bg-background py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="w-full max-w-3xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8 lg:mb-10"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight">My Profile</h1>
          <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mt-2 sm:mt-3">Manage your profile information and account settings</p>
        </motion.div>

        {/* Profile Information Card */}
        <Card className="rounded-lg sm:rounded-xl lg:rounded-2xl shadow-md sm:shadow-lg border border-border/50 bg-card mb-4 sm:mb-6 overflow-hidden">
          <CardHeader className="border-b border-border/50 pb-3 sm:pb-4 lg:pb-6 px-4 sm:px-6 pt-4 sm:pt-5">
            <CardTitle className="text-lg sm:text-xl lg:text-2xl font-semibold leading-tight">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-5 sm:pt-6 lg:pt-8 px-4 sm:px-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-3 sm:gap-4 mb-5 sm:mb-6 lg:mb-8 pb-5 sm:pb-6 lg:pb-8 border-b border-border/50">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 border-4 border-border shadow-md flex-shrink-0">
                {photoPreview ? (
                  <AvatarImage src={photoPreview} />
                ) : (
                  <AvatarImage src="https://api.dicebear.com/7.x/thumbs/svg?seed=user" />
                )}
                <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              {!isEditing && (
                <Button variant="outline" className="rounded-lg px-3 sm:px-4 lg:px-6 py-2 sm:py-2 text-xs sm:text-sm lg:text-base font-medium">
                  Change Picture
                </Button>
              )}
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {!isEditing ? (
                // VIEW MODE
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.fullName || user?.name || ""}
                      readOnly
                      className="w-full rounded-lg bg-muted/50 border-border/50 text-sm px-3 sm:px-4 py-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Email</Label>
                    <Input
                      id="email"
                      value={user?.email}
                      readOnly
                      className="w-full rounded-lg bg-muted/50 border-border/50 text-sm px-3 sm:px-4 py-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Mobile Number</Label>
                    <Input
                      id="mobile"
                      value={formData.mobile}
                      readOnly
                      className="w-full rounded-lg bg-muted/50 border-border/50 text-sm px-3 sm:px-4 py-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      value={formData.dateOfBirth}
                      readOnly
                      className="w-full rounded-lg bg-muted/50 border-border/50 text-sm px-3 sm:px-4 py-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      readOnly
                      className="w-full rounded-lg bg-muted/50 border-border/50 text-sm px-3 sm:px-4 py-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium text-muted-foreground">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      readOnly
                      className="w-full rounded-lg bg-muted/50 border-border/50 text-sm px-3 sm:px-4 py-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Center Name</Label>
                    <Input
                      id="centerName"
                      value={formData.centerName}
                      readOnly
                      className="w-full rounded-lg bg-muted/50 border-border/50 text-sm px-3 sm:px-4 py-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Provider</Label>
                    <Input
                      id="provider"
                      value={user?.provider}
                      readOnly
                      className="w-full rounded-lg bg-muted/50 border-border/50 text-sm px-3 sm:px-4 py-2"
                    />
                  </div>
                </div>
              ) : (
                // EDIT MODE
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-xs sm:text-sm font-medium">Full Name</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full rounded-lg text-sm px-3 sm:px-4 py-2"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-view" className="text-xs sm:text-sm font-medium">Email</Label>
                    <Input
                      id="email-view"
                      value={user?.email}
                      readOnly
                      className="w-full rounded-lg bg-muted/50 border-border/50 cursor-not-allowed text-sm px-3 sm:px-4 py-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobile-edit" className="text-xs sm:text-sm font-medium">Mobile Number</Label>
                    <Input
                      id="mobile-edit"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="w-full rounded-lg text-sm px-3 sm:px-4 py-2"
                      placeholder="Enter your mobile number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dob-edit" className="text-xs sm:text-sm font-medium">Date of Birth</Label>
                    <Input
                      id="dob-edit"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full rounded-lg text-sm px-3 sm:px-4 py-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address-edit" className="text-xs sm:text-sm font-medium">Address</Label>
                    <Input
                      id="address-edit"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full rounded-lg text-sm px-3 sm:px-4 py-2"
                      placeholder="Enter your address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city-edit" className="text-xs sm:text-sm font-medium">City</Label>
                    <Input
                      id="city-edit"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full rounded-lg text-sm px-3 sm:px-4 py-2"
                      placeholder="Enter your city"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="centerName-edit" className="text-xs sm:text-sm font-medium">Center Name</Label>
                    <Input
                      id="centerName-edit"
                      value={formData.centerName}
                      onChange={(e) => setFormData({ ...formData, centerName: e.target.value })}
                      className="w-full rounded-lg text-sm px-3 sm:px-4 py-2"
                      placeholder="Enter center name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="provider-view" className="text-xs sm:text-sm font-medium">Provider</Label>
                    <Input
                      id="provider-view"
                      value={user?.provider}
                      readOnly
                      className="w-full rounded-lg bg-muted/50 border-border/50 cursor-not-allowed text-sm px-3 sm:px-4 py-2"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border/50">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full rounded-lg py-3 sm:py-6 text-sm sm:text-base font-medium bg-blue-600 hover:bg-blue-700"
                >
                  Edit Profile
                </Button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 rounded-lg py-2 sm:py-3 lg:py-4 text-xs sm:text-sm lg:text-base font-medium"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      localStorage.setItem("userProfile", JSON.stringify(formData));
                      setIsEditing(false);
                    }}
                    className="flex-1 rounded-lg py-2 sm:py-3 lg:py-4 text-xs sm:text-sm lg:text-base font-medium bg-green-600 hover:bg-green-700"
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Settings Card */}
        <Card className="rounded-lg sm:rounded-xl lg:rounded-2xl shadow-md sm:shadow-lg border border-border/50 bg-card overflow-hidden">
          <CardHeader className="border-b border-border/50 pb-3 sm:pb-4 lg:pb-6 px-4 sm:px-6 pt-4 sm:pt-5">
            <CardTitle className="text-lg sm:text-xl lg:text-2xl font-semibold leading-tight">Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="pt-5 sm:pt-6 lg:pt-8 px-4 sm:px-6 space-y-3 sm:space-y-4 pb-4 sm:pb-6">
            <Button
              variant="outline"
              className="w-full rounded-lg py-2 sm:py-3 lg:py-4 text-xs sm:text-sm lg:text-base font-medium"
            >
              Change Password
            </Button>
            <Button
              variant="destructive"
              className="w-full rounded-lg py-2 sm:py-3 lg:py-4 text-xs sm:text-sm lg:text-base font-medium"
            >
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Userprofile;
