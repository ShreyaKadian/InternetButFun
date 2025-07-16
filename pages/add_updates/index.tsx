// pages/add-updates.tsx
import { useState } from "react";
import { Input, Textarea, Button } from "@heroui/react";
import { auth } from "../../firebase/firebase";

export default function AddUpdatesPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleSubmit = async () => {
    setMessage("");

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not logged in");

      const token = await user.getIdToken();

      let image_url = "";

      if (imageFile) {
        image_url = await toBase64(imageFile);
      }

      const res = await fetch("http://localhost:8000/add_updates", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          image_url,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to post update");
      }

      setMessage("✅ Update posted!");
      setTitle("");
      setContent("");
      setImageFile(null);
    } catch (err) {
      setMessage("❌ " + (err as any).message);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold">Post Update</h2>

      <Input
        isClearable
        className="w-full"
        label="Title"
        placeholder="Enter your title"
        type="text"
        variant="bordered"
        value={title}
        onClear={() => setTitle("")}
        onChange={(e) => setTitle(e.target.value)}
      />

      <Textarea
        className="max-w-xs"
        label="Description"
        labelPlacement="outside"
        placeholder="Enter your description"
        variant="bordered"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <input type="file" accept="image/*" onChange={handleImageChange} />

      <Button color="primary" onClick={handleSubmit}>
        Post
      </Button>

      {message && (
        <div
          className={`text-sm ${
            message.startsWith("✅") ? "text-green-500" : "text-red-500"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
