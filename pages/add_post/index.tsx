import { useState } from "react";
import { Input, Textarea, Button } from "@heroui/react";
import DefaultLayout from "@/layouts/default";
import { auth } from "../../firebase/firebase";

export default function AddPostPage() {
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

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const cleanApiUrl = API_URL.replace(/\/+$/, "");
      const fetchUrl = `${cleanApiUrl}/posts`;
      console.log("Posting to:", fetchUrl);

      const res = await fetch(fetchUrl, {
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
        throw new Error(errText || `Failed to post, status: ${res.status}`);
      }

      setMessage("✅ Post created!");
      setTitle("");
      setContent("");
      setImageFile(null);
    } catch (err) {
      console.error("Error creating post:", err);
      setMessage("❌ " + (err as any).message);
    }
  };

  return (
    <DefaultLayout>
      <div className="flex flex-col items-center gap-4 p-6 max-w-md mx-auto mt-20 rounded-xl bg-[#FFFCE1] shadow text-black">
        <h2 className="text-xl font-semibold">Create Post</h2>

        <Input
          isClearable
          className="w-full"
          classNames={{
            base: "border border-2 focus-within:border-black",
            inputWrapper: "bg-white focus-within:bg-white",
            input: "bg-white hover:bg-white placeholder:text-black",
            label: "text-black",
          }}
          placeholder="Enter a title"
          type="text"
          value={title}
          variant="bordered"
          onChange={(e) => setTitle(e.target.value)}
          onClear={() => setTitle("")}
        />

        <Textarea
          isClearable
          className="w-full"
          classNames={{
            base: "border border-2 focus-within:border-black",
            inputWrapper: "bg-white focus-within:bg-white",
            input: "bg-white hover:bg-white placeholder:text-black",
            label: "text-black",
          }}
          placeholder="Write your post here..."
          value={content}
          variant="bordered"
          onChange={(e) => setContent(e.target.value)}
          onClear={() => setContent("")}
        />

        <div className="w-full">
          <label htmlFor="image-upload" className="block font-medium text-sm text-black mb-1">
            Add Image
          </label>
          <input
            id="image-upload"
            accept="image/*"
            type="file"
            onChange={handleImageChange}
            className="w-full text-sm text-black"
          />
        </div>

        <Button
          className="w-full bg-black text-white hover:bg-gray transition-colors"
          onClick={handleSubmit}
        >
          Post
        </Button>

        {message && (
          <div
            className={`text-sm text-center w-full ${
              message.startsWith("✅") ? "text-green-600 font-medium" : "text-red-600"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}