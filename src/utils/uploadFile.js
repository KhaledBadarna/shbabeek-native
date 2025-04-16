export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      type: file.mimeType || "application/octet-stream",
      name: file.name || "upload.file",
    });
    formData.append("upload_preset", "profile_upload"); // replace with your preset
    formData.append("cloud_name", "dmewlyit3");

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dmewlyit3/auto/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    // ✅ get the URL and name
    return {
      url: data.secure_url,
      name: data.original_filename,
    };
  } catch (err) {
    console.error("Upload error:", err);
    throw err;
  }
};
