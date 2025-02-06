"use client";

import { Box, Button, Flex, Input } from "brainly-style-guide";
import React from "react";
import { useRouter } from "next/navigation";
import { revalidatePage } from "@/utils/revalidatePage";
import { useSession } from "next-auth/react";

export const AddRecipeFullForm = () => {
  const [file, setFile] = React.useState<File | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    alert(JSON.stringify(data));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
      />
      <button type="submit">Upload</button>
    </form>
  );
};
