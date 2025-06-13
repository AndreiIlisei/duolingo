"use client";

import { useState } from "react";

export default function TestUploadPage() {
  const [url, setUrl] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setUrl(data.url);
  };

  return (
    <div style={{ padding: 32 }}>
      <input type="file" onChange={handleFileChange} />
      {url && (
        <p>
          ✅ Uploaded to: <a href={url}>{url}</a>
        </p>
      )}
    </div>
  );
}
