import { useState, useRef, ChangeEvent, MouseEvent } from "react";
import { useRouter } from "next/router";
import { Input } from "@heroui/react";
import { Button } from "@heroui/react";

import DefaultLayout from "@/layouts/default";

export default function IndexPage() {
  const router = useRouter();
  const [aboutyou, setaboutyou] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [username, setusername] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>(
    "https://placehold.co/600x400?text=Click+to+Upload",
  );
  const [likes, setLikes] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [usernameError, setUsernameError] = useState<string>("");

  const categories = [
    "Youtube",
    "Memes",
    "Politics",
    "Film",
    "Music",
    "Pop Culture",
  ];

  const getAuthToken = async (): Promise<string | null> => {
    const { auth } = await import("../../firebase/firebase");
    const user = auth.currentUser;

    if (user) {
      return await user.getIdToken();
    }

    return null;
  };

  const bye = async () => {
    if (!username.trim()) {
      alert("Please enter a username");

      return;
    }
    if (!aboutyou.trim()) {
      alert("Please tell us about yourself");

      return;
    }
    if (likes.length === 0) {
      alert("Please select at least one interest");

      return;
    }

    setLoading(true);
    try {
      const token = await getAuthToken();

      if (!token) {
        alert("Please log in first");
        setLoading(false);

        return;
      }

      const profileData = {
        username: username.trim(),
        aboutyou: aboutyou.trim(),
        likes: likes,
        imageUrl:
          imageUrl !== "https://placehold.co/600x400?text=Click+to+Upload"
            ? imageUrl
            : null,
      };

      const response = await fetch("http://localhost:8000/complete-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        const result = await response.json();

        alert("Profile created successfully!");
        router.push("/");
      } else {
        const error = await response.json();

        alert(`Error: ${error.detail}`);
      }
    } catch (error) {
      console.error("Error creating profile:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const Addtolist = (category: string) => {
    if (likes.includes(category)) {
      setLikes(likes.filter((item) => item !== category));
    } else {
      setLikes([...likes, category]);
    }
  };

  const handleImageClick = (e: MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];

    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          setImageUrl(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const checkUsernameAvailability = async (usernameToCheck: string) => {
    if (usernameToCheck.length < 3) {
      setUsernameError("Username must be at least 3 characters");

      return;
    }

    try {
      const token = await getAuthToken();

      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/check-username/${usernameToCheck}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const result = await response.json();

        if (!result.available) {
          setUsernameError("Username is already taken");
        } else {
          setUsernameError("");
        }
      }
    } catch (error) {
      console.error("Error checking username:", error);
    }
  };

  const handleUsernameChange = (value: string) => {
    setusername(value);
    if (value.trim()) {
      setTimeout(() => checkUsernameAvailability(value.trim()), 500);
    } else {
      setUsernameError("");
    }
  };

  return (
    <DefaultLayout>
      <div className="flex flex-col items-center mt-20 gap-0 p-6 max-w-md mx-auto rounded-xl shadow bg-[#FFFCE1] text-black">
        <h2 className="text-xl font-semibold">
          {"Welcome! Let's set up your profile"}
        </h2>

        <div className="p-8">
          <button
            type="button"
            onClick={handleImageClick}
            className="w-96 h-72 rounded-lg cursor-pointer hover:opacity-80 transition-opacity border border-black bg-black"
          >
            <img
              alt="Click to change"
              className="w-full h-full object-cover rounded-lg"
              src={imageUrl}
              onError={() =>
                setImageUrl("https://placehold.co/600x400?text=Click+to+Upload")
              }
            />
          </button>
          <input 
            ref={fileInputRef}
            accept="image/*"
            className="hidden "
            type="file"
            onChange={handleFileChange}
          />
        </div>

                  <p className="text-sm text-black mb-2 w-full ml-2">Enter some info:</p>

        <Input
          isClearable
          className="w-full"
              classNames={{
      base: "border border-2 focus-within:border-black",
      inputWrapper: "bg-white focus-within:bg-white",
      input: "bg-white hover:bg-white placeholder:text-black",
      label: "text-black",
    }}

          errorMessage={usernameError}
          isInvalid={!!usernameError}
          placeholder="Choose a unique username"
          value={username}
          variant="bordered"
          onChange={(e) => handleUsernameChange(e.target.value)}
          onClear={() => {
            setusername("");
            setUsernameError("");
          }}
        />

        <Input
          isClearable
              classNames={{
      base: "border border-2 focus-within:border-black",
      inputWrapper: "bg-white focus-within:bg-white",
      input: "bg-white hover:bg-white placeholder:text-black",
      label: "text-black",
    }}

          className="w-full"
          placeholder="Tell us about yourself"
          value={aboutyou}
          variant="bordered"
          onChange={(e) => setaboutyou(e.target.value)}
          onClear={() => setaboutyou("")}
        />

        <div className="w-full mt-3">
          <p className="text-sm text-black mb-2">Select your interests:</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                className={`transition-all duration-200 ${
                  likes.includes(category)
                    ? "bg-black text-white hover:bg-gray-900"
                    : "text-black border border-black hover:bg-black hover:text-white"
                }`}
                size="sm"
                variant={likes.includes(category) ? "solid" : "ghost"}
                onClick={() => Addtolist(category)}
              >
                {category}
              </Button>
            ))}
          </div>
          {likes.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Selected: {likes.join(", ")}
            </p>
          )}
        </div>

        <Button
          className="w-full bg-black text-white hover:bg-gray-900"
          disabled={loading || !!usernameError}
          isLoading={loading}
          onClick={bye}
        >
          {loading ? "Creating Profile..." : "Complete Profile"}
        </Button>
      </div>
    </DefaultLayout>
  );
}