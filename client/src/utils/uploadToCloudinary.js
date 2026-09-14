const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Uploads directly from the browser to Cloudinary using an UNSIGNED upload
// preset — no backend involvement needed. This is safe to expose client-side
// (cloud name + preset name aren't secrets) as long as the preset itself is
// configured with sensible restrictions (file size/type limits) in the
// Cloudinary dashboard, since anyone with these two values could otherwise
// upload arbitrary files to your account.
export async function uploadImageToCloudinary(file) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary isn't configured — set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET"
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.error?.message || "Image upload failed");
  }

  const data = await res.json();
  return data.secure_url;
}
