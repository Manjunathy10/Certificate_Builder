import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useAuthStore from "@/auth/store";
import apiClient from "@/config/ApiClient";
import toast from "react-hot-toast";

interface FormData {
  fullName: string;
  email: string;
  mobileNumber: string;
  dateOfBirth: string;
  address: string;
  deliveryAddress: string;
  state: string;
  district: string;
  city: string;
  pincode: string;
  deliveryState: string;
  deliveryDistrict: string;
  deliveryCity: string;
  deliveryPincode: string;
  identificationNumber: string;
  centerName: string;
  deliveryPartner: string;
  startDate: string;
  endDate: string;
  profilePhoto: File | null;
  photoUrl: string;
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
  const [sameAsPermanent, setSameAsPermanent] = useState(true);
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
    deliveryState: "",
    deliveryDistrict: "",
    deliveryCity: "",
    deliveryPincode: "",
    identificationNumber: "",
    centerName: "",
    deliveryPartner: "",
    startDate: "",
    endDate: "",
    profilePhoto: null,
    photoUrl: "",
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const existingProfile = localProfile ?? profileFromStore;
  const existingAddresses = addresses.length > 0 ? addresses : localAddresses;
  const hasProfile = Boolean(existingProfile);

  useEffect(() => {
    console.log("ADDRESSES:", addresses);
  }, [addresses]);

  const copyPermanentToDelivery = (data: FormData): FormData => ({
    ...data,
    deliveryAddress: data.address,
    deliveryCity: data.city,
    deliveryDistrict: data.district,
    deliveryState: data.state,
    deliveryPincode: data.pincode,
  });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: value,
      } as FormData;

      if (
        sameAsPermanent &&
        ["address", "city", "district", "state", "pincode"].includes(name)
      ) {
        return copyPermanentToDelivery(next);
      }

      return next;
    });

    if (name in errors) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const inputErrorClass = (field: ValidationField) =>
    errors[field]
      ? "border-red-500 focus-visible:ring-red-500 dark:border-red-500"
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
  }, [isEditMode, existingProfile, existingAddresses]);

  const handleSameAsPermanentChange = (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSameAsPermanent(checked);

    if (checked) {
      setFormData((prev) => copyPermanentToDelivery(prev));
    }
  };

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      profilePhoto: file,
    }));

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
  };

  const isFormValid = () =>
    Boolean(
      formData.fullName.trim() &&
        formData.email.trim() &&
        formData.mobileNumber.trim() &&
        formData.dateOfBirth.trim() &&
        formData.address.trim() &&
        formData.state.trim() &&
        formData.city.trim() &&
        formData.pincode.trim() &&
        formData.identificationNumber.trim() &&
        formData.centerName.trim() &&
        formData.startDate.trim() &&
        formData.profilePhoto
    );

  const handleFinish = async () => {
    if (!validate()) {
      toast.error("Please fix highlighted errors");
      return;
    }

    if (!isFormValid()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.fullName.trim() || !formData.mobileNumber.trim()) {
      toast.error("Full name and mobile number are required");
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

    const toYyyyMmDd = (value: string) => formatDateForInput(value);

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
      const status =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { status?: number } }).response?.status ===
          "number"
          ? (error as { response?: { status?: number } }).response?.status
          : undefined;

      if (status === 409 || status === 405) {
        try {
          await apiClient.put(`/profile/${userId}`, payload);
          toast.success("Profile saved successfully");
          setIsEditMode(false);
          return;
        } catch {
          // fall through to generic error handling below
        }
      }

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void handleFinish();
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
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="shadow-lg">
            <CardContent className="p-6 space-y-6">
              <div className="mb-2 border-b pb-3">
                <h2 className="text-2xl font-semibold">Profile</h2>
                <p className="text-sm text-muted-foreground">
                  Review your profile details
                </p>
              </div>

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
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="mb-6 border-b pb-3">
              <h2 className="text-2xl font-semibold">Profile</h2>
              <p className="text-sm text-muted-foreground">
                Enter profile details carefully
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className={inputErrorClass("fullName")}
                    />
                    {errors.fullName ? (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.fullName}</p>
                    ) : null}
                  </div>

                  <div>
                    <Label htmlFor="identificationNumber">Identification Number *</Label>
                    <Input
                      id="identificationNumber"
                      type="text"
                      name="identificationNumber"
                      value={formData.identificationNumber}
                      onChange={handleInputChange}
                      placeholder="Enter your identification number"
                      className={inputErrorClass("identificationNumber")}
                    />
                    {errors.identificationNumber ? (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.identificationNumber}</p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Contact Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mobileNumber">Mobile Number *</Label>
                    <Input
                      id="mobileNumber"
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      placeholder="Enter your mobile number"
                      className={inputErrorClass("mobileNumber")}
                    />
                    {errors.mobileNumber ? (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.mobileNumber}</p>
                    ) : null}
                  </div>

                  <div>
                    <Label htmlFor="deliveryPartner">Delivery Partner</Label>
                    <Input
                      id="deliveryPartner"
                      type="text"
                      name="deliveryPartner"
                      value={formData.deliveryPartner}
                      onChange={handleInputChange}
                      placeholder="Enter delivery partner"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email ID *</Label>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Center Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="centerName">Center Name *</Label>
                    <Input
                      id="centerName"
                      type="text"
                      name="centerName"
                      value={formData.centerName}
                      onChange={handleInputChange}
                      placeholder="Enter center name"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Dates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className={inputErrorClass("dateOfBirth")}
                    />
                    {errors.dateOfBirth ? (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.dateOfBirth}</p>
                    ) : null}
                  </div>

                  <div>
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Permanent Address *</Label>
                    <Input
                      id="address"
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter your residential address"
                    />
                  </div>

                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="Enter state"
                    />
                  </div>

                  <div>
                    <Label htmlFor="district">District</Label>
                    <Input
                      id="district"
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      placeholder="Enter district"
                    />
                  </div>

                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Enter city"
                    />
                  </div>

                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="Enter pincode"
                      className={inputErrorClass("pincode")}
                    />
                    {errors.pincode ? (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.pincode}</p>
                    ) : null}
                  </div>

                  <div className="md:col-span-2 mt-2">
                    <label className="inline-flex items-center gap-2 text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={sameAsPermanent}
                        onChange={handleSameAsPermanentChange}
                        className="h-4 w-4 rounded border-input"
                      />
                      Same as Permanent Address
                    </label>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="deliveryAddress">Current / Delivery Address</Label>
                    <Input
                      id="deliveryAddress"
                      type="text"
                      name="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={handleInputChange}
                      disabled={sameAsPermanent}
                      className="disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Enter delivery address"
                    />
                  </div>

                  <div>
                    <Label htmlFor="deliveryState">Delivery State</Label>
                    <Input
                      id="deliveryState"
                      type="text"
                      name="deliveryState"
                      value={formData.deliveryState}
                      onChange={handleInputChange}
                      disabled={sameAsPermanent}
                      className="disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Enter delivery state"
                    />
                  </div>

                  <div>
                    <Label htmlFor="deliveryDistrict">Delivery District</Label>
                    <Input
                      id="deliveryDistrict"
                      type="text"
                      name="deliveryDistrict"
                      value={formData.deliveryDistrict}
                      onChange={handleInputChange}
                      disabled={sameAsPermanent}
                      className="disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Enter delivery district"
                    />
                  </div>

                  <div>
                    <Label htmlFor="deliveryCity">Delivery City</Label>
                    <Input
                      id="deliveryCity"
                      type="text"
                      name="deliveryCity"
                      value={formData.deliveryCity}
                      onChange={handleInputChange}
                      disabled={sameAsPermanent}
                      className="disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Enter delivery city"
                    />
                  </div>

                  <div>
                    <Label htmlFor="deliveryPincode">Delivery Pincode</Label>
                    <Input
                      id="deliveryPincode"
                      type="text"
                      name="deliveryPincode"
                      value={formData.deliveryPincode}
                      onChange={handleInputChange}
                      disabled={sameAsPermanent}
                      className="disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Enter delivery pincode"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Photo Upload</h3>
                <Label htmlFor="profilePhoto">Upload Profile Photo *</Label>
                <Input
                  id="profilePhoto"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Allowed: JPG, PNG, WEBP | Max size: 5MB
                </p>

                {photoPreview ? (
                  <div className="mt-4">
                    <Label>Photo Preview</Label>
                    <div className="mt-2 h-28 w-28 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                      <img
                        src={photoPreview}
                        alt="Profile preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={!isFormValid() || isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </form>

            {!isFormValid() ? (
              <p className="mt-4 text-sm text-red-600 dark:text-red-400">
                Please fill in all required fields
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
