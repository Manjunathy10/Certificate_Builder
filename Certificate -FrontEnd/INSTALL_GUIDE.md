# Image Cropping Setup Guide

## Installation Required

The enhanced profile photo upload feature requires the `react-easy-crop` library.

### Install the dependency:

```bash
npm install react-easy-crop
```

or if using yarn:

```bash
yarn add react-easy-crop
```

## Features Added

### 1. Image Upload
- ✅ Select image from device
- ✅ Drag & drop support
- ✅ Image preview

### 2. Image Crop Interface
- ✅ Square crop (1:1 ratio)
- ✅ Circular preview (for profile photos)
- ✅ Zoom in/out with slider
- ✅ Drag to adjust image position
- ✅ Live preview during cropping

### 3. Image Validation
- ✅ Accept only JPG/PNG formats
- ✅ Maximum file size: 5MB
- ✅ Error messages for invalid uploads

### 4. UI/UX Improvements
- ✅ TailwindCSS styling
- ✅ Dark/Light mode support
- ✅ Responsive design (Mobile, Tablet, Desktop)
- ✅ Smooth animations with framer-motion
- ✅ Professional card-based layout

### 5. User Flow
1. User uploads an image (JPG or PNG, max 5MB)
2. Crop interface opens with zoom and drag controls
3. User adjusts crop area and zoom level
4. User clicks "Apply Crop" to confirm
5. Cropped image is displayed as circular profile photo
6. User can click "Change Photo" to upload a different image
7. On "Complete Profile", cropped image is saved and user redirected to dashboard

## File Structure

- `src/pages/users/Userprofile.tsx` - Main component with cropping logic
- Imports `react-easy-crop` for the Cropper component
- Uses Zustand for auth state management
- Integrates with existing TailwindCSS theme

## Component State Management

### Crop-related state:
- `isCropping` - Toggle between upload and crop interface
- `imageToCrop` - Base64 string of selected image
- `croppedArea` - Pixel coordinates of crop area
- `crop` - Current crop position {x, y}
- `zoom` - Current zoom level
- `errorMessage` - Display validation errors

### Profile data state:
- `formData.profilePhoto` - File object of cropped image
- `photoPreview` - Base64 string of final cropped image

## Validation Rules

- **File Types**: Only JPG (image/jpeg) and PNG (image/png)
- **File Size**: Maximum 5MB
- **Crop Ratio**: 1:1 (square)
- **Preview**: Circular (for profile photos)

## API Integration (TODO)

Line in component:
```typescript
// TODO: Call API to save profile data
```

Replace with your backend API call:
```typescript
const response = await saveProfileAPI(formData);
```

## Dependencies Added

```json
{
  "react-easy-crop": "^4.7.4" (or latest version)
}
```

## Browser Compatibility

- Chrome / Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- IE11: ❌ Not supported (uses modern Canvas API)

## Notes

- The component uses Canvas API for image cropping (client-side)
- No server-side processing needed for crop operation
- Cropped image is converted to JPEG format for consistency
- Original image is not modified; only cropped version is saved
