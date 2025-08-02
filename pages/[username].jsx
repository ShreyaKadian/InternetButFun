import { useState, useRef, ChangeEvent, MouseEvent } from "react";
import { useRouter } from "next/router";
import { Input, Button } from "@heroui/react";
import DefaultLayout from "@/layouts/default";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function IndexPage() {
  const router = useRouter();
  const [aboutyou, setaboutyou] = useState("");
  const fileInputRef = useRef(null);
  const [username, setusername] = useState("");
  const [imageUrl, setImageUrl] = useState("https://placehold.co/600x400?text=Click+to+Upload");
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState("");

  const categories = ["Youtube", "Memes", "Politics", "Film", "Music", "Pop Culture"];

  const getAuthToken = async () => {
    const { auth } = await import("../../firebase/firebase");
    const user = auth.currentUser;
    return user ? await user.getIdToken() : null;
  };

  const bye = async () => {
    if (!username.trim()) return alert("Please enter a username");
    if (!aboutyou.trim()) return alert("Please tell us about yourself");
    if (likes.length === 0) return alert("Please select at least one interest");

    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        alert("Please log in first");
        setLoading(false);
        return;
      }
      if (!API_URL || API_URL.includes("localhost")) {
        console.error("Invalid API_URL:", API_URL);
        alert("Server configuration error. Contact support.");
        return;
      }

      const profileData = {
        username: username.trim(),
        aboutyou: aboutyou.trim(),
        likes,
        imageUrl: imageUrl !== "https://placehold.co/600x400?text=Click+to+Upload" ? imageUrl : null,
      };

      const response = await fetch(`${API_URL.replace(/\/+$/, "")}/complete-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
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

  const Addtolist = (category) => {
    setLikes((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category]
    );
  };

  const handleImageClick = (e) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImageUrl(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const checkUsernameAvailability = async (usernameToCheck) => {
    if (usernameToCheck.length < 3) {
      setUsernameError("Username must be at least 3 characters");
      return;
    }
    try {
      const token = await getAuthToken();
      if (!token) return;
      if (!API_URL || API_URL.includes("localhost")) {
        console.error("Invalid API_URL:", API_URL);
        return;
      }
      const response = await fetch(`${API_URL.replace(/\/+$/, "")}/check-username/${usernameToCheck}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      setUsernameError(result.available ? "" : "Username is already taken");
    } catch (error) {
      console.error("Error checking username:", error);
    }
  };

  const handleUsernameChange = (value) => {
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
        <h2 className="text-xl font-semibold">{"Welcome! Let's set up your profile"}</h2>

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
              onError={() => setImageUrl("https://placehold.co/600x400?text=Click+to+Upload")}
            />
          </button>
          <input
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            type="file"
            onChange={handleFileChange}
          />
        </div>

        <Input
          isClearable
          className="w-full"
          classNames={{
            base: "border border-2 focus-within:border-black",
            inputWrapper: "bg-white",
            input: "bg-white placeholder:text-black",
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
          className="w-full"
          classNames={{
            base: "border border-2 focus-within:border-black",
            inputWrapper: "bg-white",
            input: "bg-white placeholder:text-black",
            label: "text-black",
          }}
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
            <p className="text-xs text-gray-500 mt-1">Selected: {likes.join(", ")}</p>
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
