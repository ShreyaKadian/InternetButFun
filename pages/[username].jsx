"use client";
import { auth, onAuthStateChanged } from "../firebase/firebase";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";
import { Navbar2 } from "@/components/navbar2";
import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { Avatar, AvatarGroup, AvatarIcon } from "@heroui/avatar";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Input, Textarea, Button } from "@heroui/react";
import PostCard from "@/components/Postcard";
import NextLink from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const { username } = router.query;
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showInitialForm, setShowInitialForm] = useState(false);
  const [initialProfileData, setInitialProfileData] = useState({
    username: "",
    aboutyou: "",
    likes: "",
    imageUrl: "",
  });
  const [formData, setFormData] = useState({
    username: "",
    aboutyou: "",
    likes: [],
    mood: "",
    status: "",
    socialLinks: {
      spotify: "",
      letterboxd: "",
      discord: "",
      instagram: "",
      twitter: "",
      website: "",
    },
    imageUrl: "",
    age: "",
    title: "",
    location: "",
    yapTopics: {
      topic1: { name: "", description: "" },
      topic2: { name: "", description: "" },
      topic3: { name: "", description: "" },
      topic4: { name: "", description: "" },
      topic5: { name: "", description: "" },
    },
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const cleanApiUrl = API_URL.replace(/\/+$/, "");

  const getToken = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        console.log("Got Firebase token:", token ? token.substring(0, 10) + "..." : "No");
        return token;
      } catch (error) {
        console.error("Error getting token:", error);
        return null;
      }
    }
    return null;
  };

  const formatTimestamp = (createdAt) => {
    const now = new Date();
    const postDate = new Date(createdAt);
    const diffMs = now - postDate;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return postDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const handleLike = async (postId) => {
    const token = await getToken();
    if (!token) {
      alert("You must be logged in to like a post");
      return;
    }
    try {
      const fetchUrl = `${cleanApiUrl}/like-post/${postId}`;
      console.log("Liking post at:", fetchUrl);
      const response = await fetch(fetchUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const { like_count } = await response.json();
        setPosts(
          posts.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  liked: !post.liked,
                  like_count: like_count,
                }
              : post,
          ),
        );
      } else {
        const error = await response.json();
        console.error("Like error (status:", response.status, "):", error);
        alert(`Error: ${error.detail || "Failed to like post"}`);
      }
    } catch (err) {
      console.error("Error liking post:", err);
      alert("Failed to like post");
    }
  };

  const handleSave = async (postId) => {
    const token = await getToken();
    if (!token) {
      alert("You must be logged in to save a post");
      return;
    }
    try {
      const fetchUrl = `${cleanApiUrl}/save-post/${postId}`;
      console.log("Saving post at:", fetchUrl);
      const response = await fetch(fetchUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const { save_count } = await response.json();
        setPosts(
          posts.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  saved: !post.saved,
                  save_count: save_count,
                }
              : post,
          ),
        );
      } else {
        const error = await response.json();
        console.error("Save error (status:", response.status, "):", error);
        alert(`Error: ${error.detail || "Failed to save post"}`);
      }
    } catch (err) {
      console.error("Error saving post:", err);
      alert("Failed to save post");
    }
  };

  const handleComment = (postId) => {
    console.log(`Comment clicked for post ${postId}`);
    alert("Comment functionality not yet implemented");
  };

  const shouldShowEditButton = () => {
    return profile?.canEdit === true;
  };

  const handleInitialInputChange = (e) => {
    const { name, value } = e.target;
    setInitialProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInitialProfileSubmit = async (e) => {
    e.preventDefault();
    const token = await getToken();
    if (!token) {
      console.error("No token available");
      setError("Please log in to register your profile");
      return;
    }
    try {
      const fetchUrl = `${cleanApiUrl}/Auth`;
      console.log("Registering profile at:", fetchUrl);
      const response = await fetch(fetchUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: initialProfileData.username,
          aboutyou: initialProfileData.aboutyou,
          likes: initialProfileData.likes
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item),
          imageUrl: initialProfileData.imageUrl || null,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log("User registered:", data);
        setShowInitialForm(false);
        if (data.username) {
          router.push(`/${data.username}`);
        }
      } else {
        console.error("Error registering user (status:", response.status, "):", data.detail);
        setError(data.detail || "Failed to register profile");
      }
    } catch (error) {
      console.error("Error submitting initial profile:", error);
      setError("Failed to register profile");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log(
        "Auth state changed:",
        user ? `User: ${user.email}` : "No user",
      );
      if (user) {
        const userInfo = { uid: user.uid, email: user.email };
        setCurrentUser(userInfo);
        console.log("Set current user:", userInfo);
        try {
          const token = await user.getIdToken();
          const fetchUrl = `${cleanApiUrl}/Auth`;
          console.log("Checking registration at:", fetchUrl);
          const response = await fetch(fetchUrl, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();
          if (data.profile_complete === false) {
            setShowInitialForm(true);
          }
        } catch (error) {
          console.error("Error checking user registration:", error);
          setError("Failed to check user registration");
        }
      } else {
        setCurrentUser(null);
        console.log("No current user");
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!username || authLoading) return;
    const fetchProfileData = async () => {
      try {
        const token = await getToken();
        console.log("Fetching profile, token exists:", !!token);
        console.log("Fetching for username:", username);
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        console.log("Fetching profile with headers:", headers);
        const profileUrl = `${cleanApiUrl}/profile/${encodeURIComponent(username)}`;
        console.log("Fetching profile at:", profileUrl);
        const profileResponse = await fetch(profileUrl, { headers });
        console.log("Profile fetch response status:", profileResponse.status);
        if (!profileResponse.ok) {
          const errorText = await profileResponse.text();
          console.error("Profile fetch error (status:", profileResponse.status, "):", errorText);
          throw new Error(
            `Failed to fetch profile: ${profileResponse.status} ${errorText}`,
          );
        }
        const profileData = await profileResponse.json();
        console.log("Profile response:", profileData);
        console.log("Is page editable?", profileData.canEdit ? "Yes" : "No");
        setProfile(profileData);
        setFormData({
          username: profileData.username || "",
          aboutyou: profileData.aboutyou || "",
          likes: Array.isArray(profileData.likes) ? profileData.likes : [],
          mood: profileData.mood || "",
          status: profileData.status || profileData.mood || "",
          socialLinks: profileData.socialLinks || {
            spotify: "",
            letterboxd: "",
            discord: "",
            instagram: "",
            twitter: "",
            website: "",
          },
          imageUrl: profileData.imageUrl || "",
          age: profileData.age || "",
          title: profileData.title || "",
          location: profileData.location || "",
          yapTopics: profileData.yapTopics || {
            topic1: { name: "", description: "" },
            topic2: { name: "", description: "" },
            topic3: { name: "", description: "" },
            topic4: { name: "", description: "" },
            topic5: { name: "", description: "" },
          },
        });
        const postsUrl = `${cleanApiUrl}/profile/${encodeURIComponent(username)}/posts`;
        console.log("Fetching posts at:", postsUrl);
        const postsResponse = await fetch(postsUrl);
        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          setPosts(Array.isArray(postsData) ? postsData : []);
        } else {
          console.error("Posts fetch failed (status:", postsResponse.status, "):", await postsResponse.text());
          setPosts([]);
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError(err.message);
      }
    };
    fetchProfileData();
  }, [username, currentUser, authLoading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("socialLinks.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [key]: value },
      }));
    } else if (name.startsWith("yapTopics.")) {
      const [_, topicKey, field] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        yapTopics: {
          ...prev.yapTopics,
          [topicKey]: { ...prev.yapTopics[topicKey], [field]: value },
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLikesChange = (e) => {
    const likes = e.target.value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item);
    setFormData((prev) => ({ ...prev, likes }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = await getToken();
    if (!token) {
      alert("You must be logged in to edit your profile");
      return;
    }
    try {
      const fetchUrl = `${cleanApiUrl}/profile/${username}`;
      console.log("Updating profile at:", fetchUrl);
      const response = await fetch(fetchUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const data = await response.json();
        setProfile({ ...profile, ...formData, canEdit: true });
        setIsEditing(false);
        if (formData.username !== username) {
          router.push(`/${formData.username}`);
        }
      } else {
        const error = await response.json();
        console.error("Update error (status:", response.status, "):", error);
        alert(`Error: ${error.detail || "Failed to update profile"}`);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile");
    }
  };

  if (authLoading) return <div className="text-black">Loading authentication...</div>;
  if (error) return <div className="text-black">{error}</div>;

  if (showInitialForm) {
    return (
      <div className="bg-transparent min-h-screen">
        <header className="fixed top-0 left-0 h-20 bg-[#dff6da] flex items-center w-full z-50">
          <NextLink
            className="flex items-center gap-0 h-20 w-[25rem] bg-[#FFFCE1]"
            href="/"
          >
            <span className="font-bold text-[#88e7ba] text-[3.25rem] ml-[2.6rem] font-dancing">
              InternetButFun
            </span>
          </NextLink>
          <div className="flex-1 flex justify-center items-center">
            <div className="flex shadow-sm flex-column mt-3 gap-8 text-base bg-[#FFFCE1] px-5 rounded-full py-1 h-8 text-[#595540]">
              <span className="border-r-2 border-grey pr-5">Fun</span>
              <span className="border-r-2 pr-5">Wholesome</span>
              <span>Sexy</span>
            </div>
            <div className="flex shadow-sm flex-column mt-3 text-base bg-[#FFFCE1] ml-[0.2rem] w-[8rem] px-5 rounded-full py-1 h-8 text-[#595540] text-center">
              <span className="text-center">All In One</span>
            </div>
          </div>
          <div className="flex gap-3 mr-[2.6rem] mt-3">
            <a
              className="bg-[#63d1c2] shadow-md text-[#FFFCE1] px-5 rounded-full py-1 h-8 w-28 text-center font-bold transition-all duration-300 hover:bg-[#50bfb1] hover:scale-105"
              href="https://www.instagram.com"
              rel="noopener noreferrer"
              target="_blank"
            >
              Insta
            </a>
            <a
              className="bg-[#dee1ca] shadow-md text-[#a19889] px-5 rounded-full py-1 h-8 w-28 text-center font-bold transition-all duration-300 hover:bg-[#c6c9b4] hover:scale-105"
              href="https://twitter.com"
              rel="noopener noreferrer"
              target="_blank"
            >
              Twitter
            </a>
            <a
              className="bg-[#fec1a2] shadow-md text-[#d1574a] px-5 rounded-full py-1 h-8 w-28 text-center font-bold transition-all duration-300 hover:bg-[#f5a07f] hover:scale-105"
              href="https://github.com"
              rel="noopener noreferrer"
              target="_blank"
            >
              Git
            </a>
          </div>
        </header>

        <div className="container mx-auto p-4 mt-20">
          <Card className="bg-white">
            <CardHeader>
              <h3 className="text-lg font-bold text-black">Complete Your Profile</h3>
            </CardHeader>
            <CardBody className="bg-white">
              <form onSubmit={handleInitialProfileSubmit}>
                <Input
                  isClearable
                  className="w-full mb-2"
                  classNames={{
                    base: "border border-2 focus-within:border-black",
                    inputWrapper: "bg-white focus-within:bg-white",
                    input: "bg-white hover:bg-white placeholder:text-black",
                    label: "text-black",
                  }}
                  placeholder="Username"
                  type="text"
                  value={initialProfileData.username}
                  variant="bordered"
                  onChange={handleInitialInputChange}
                  onClear={() => setInitialProfileData((prev) => ({ ...prev, username: "" }))}
                  name="username"
                />
                <Textarea
                  isClearable
                  className="w-full mb-2"
                  classNames={{
                    base: "border border-2 focus-within:border-black",
                    inputWrapper: "bg-white focus-within:bg-white",
                    input: "bg-white hover:bg-white placeholder:text-black",
                    label: "text-black",
                  }}
                  placeholder="About You"
                  value={initialProfileData.aboutyou}
                  variant="bordered"
                  onChange={handleInitialInputChange}
                  onClear={() => setInitialProfileData((prev) => ({ ...prev, aboutyou: "" }))}
                  name="aboutyou"
                />
                <Input
                  isClearable
                  className="w-full mb-2"
                  classNames={{
                    base: "border border-2 focus-within:border-black",
                    inputWrapper: "bg-white focus-within:bg-white",
                    input: "bg-white hover:bg-white placeholder:text-black",
                    label: "text-black",
                  }}
                  placeholder="Likes (comma-separated)"
                  type="text"
                  value={initialProfileData.likes}
                  variant="bordered"
                  onChange={handleInitialInputChange}
                  onClear={() => setInitialProfileData((prev) => ({ ...prev, likes: "" }))}
                  name="likes"
                />
                <Input
                  isClearable
                  className="w-full mb-2"
                  classNames={{
                    base: "border border-2 focus-within:border-black",
                    inputWrapper: "bg-white focus-within:bg-white",
                    input: "bg-white hover:bg-white placeholder:text-black",
                    label: "text-black",
                  }}
                  placeholder="Image URL"
                  type="text"
                  value={initialProfileData.imageUrl}
                  variant="bordered"
                  onChange={handleInitialInputChange}
                  onClear={() => setInitialProfileData((prev) => ({ ...prev, imageUrl: "" }))}
                  name="imageUrl"
                />
                <Button type="submit" className="bg-white text-black border border-black rounded-md">
                  Submit Profile
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  if (!profile) return <div className="text-black">Loading profile...</div>;

  return (
    <div className="bg-transparent min-h-screen">
      <header className="fixed top-0 left-0 h-20 bg-[#dff6da] flex items-center w-full z-50">
        <NextLink
          className="flex items-center gap-0 h-20 w-[25rem] bg-[#FFFCE1]"
          href="/"
        >
          <span className="font-bold text-[#88e7ba] text-[3.25rem] ml-[2.6rem] font-dancing">
            InternetButFun
          </span>
        </NextLink>
        <div className="flex-1 flex justify-center items-center">
          <div className="flex shadow-sm flex-column mt-3 gap-8 text-base bg-[#FFFCE1] px-5 rounded-full py-1 h-8 text-[#595540]">
            <span className="border-r-2 border-grey pr-5">Fun</span>
            <span className="border-r-2 pr-5">Wholesome</span>
            <span>Sexy</span>
          </div>
          <div className="flex shadow-sm flex-column mt-3 text-base bg-[#FFFCE1] ml-[0.2rem] w-[8rem] px-5 rounded-full py-1 h-8 text-[#595540] text-center">
            <span className="text-center">All In One</span>
          </div>
        </div>
        <div className="flex gap-3 mr-[2.6rem] mt-3">
          <a
            className="bg-[#63d1c2] shadow-md text-[#FFFCE1] px-5 rounded-full py-1 h-8 w-28 text-center font-bold transition-all duration-300 hover:bg-[#50bfb1] hover:scale-105"
            href="https://www.instagram.com"
            rel="noopener noreferrer"
            target="_blank"
          >
            Insta
          </a>
          <a
            className="bg-[#dee1ca] shadow-md text-[#a19889] px-5 rounded-full py-1 h-8 w-28 text-center font-bold transition-all duration-300 hover:bg-[#c6c9b4] hover:scale-105"
            href="https://twitter.com"
            rel="noopener noreferrer"
            target="_blank"
          >
            Twitter
          </a>
          <a
            className="bg-[#fec1a2] shadow-md text-[#d1574a] px-5 rounded-full py-1 h-8 w-28 text-center font-bold transition-all duration-300 hover:bg-[#f5a07f] hover:scale-105"
            href="https://github.com"
            rel="noopener noreferrer"
            target="_blank"
          >
            Git
          </a>
        </div>
      </header>

      <div className="container mx-auto p-4 flex flex-col md:flex-row gap-4 mt-20 text-black">
        <div className="flex flex-col w-full md:w-3/4 gap-4">
          <Card className="py-4 px-1 w-full bg-white">
            <CardHeader className="pb-0 pt-2 px-3 flex items-start">
              <Avatar
                className="rounded-xl object-cover size-52"
                src={profile.imageUrl}
                name={profile.username}
              />
              <div>
                {isEditing ? (
                  <>
                    <Input
                      isClearable
                      className="w-full ml-4 mt-4"
                      classNames={{
                        base: "border border-2 focus-within:border-black",
                        inputWrapper: "bg-white focus-within:bg-white",
                        input: "bg-white hover:bg-white placeholder:text-black",
                        label: "text-black",
                      }}
                      placeholder="Username"
                      type="text"
                      value={formData.username}
                      variant="bordered"
                      onChange={handleInputChange}
                      onClear={() => setFormData((prev) => ({ ...prev, username: "" }))}
                      name="username"
                    />
                    <Input
                      isClearable
                      className="w-full ml-4 mt-2"
                      classNames={{
                        base: "border border-2 focus-within:border-black",
                        inputWrapper: "bg-white focus-within:bg-white",
                        input: "bg-white hover:bg-white placeholder:text-black",
                        label: "text-black",
                      }}
                      placeholder="Title"
                      type="text"
                      value={formData.title}
                      variant="bordered"
                      onChange={handleInputChange}
                      onClear={() => setFormData((prev) => ({ ...prev, title: "" }))}
                      name="title"
                    />
                    <Input
                      isClearable
                      className="w-full ml-4 mt-2"
                      classNames={{
                        base: "border border-2 focus-within:border-black",
                        inputWrapper: "bg-white focus-within:bg-white",
                        input: "bg-white hover:bg-white placeholder:text-black",
                        label: "text-black",
                      }}
                      placeholder="Location"
                      type="text"
                      value={formData.location}
                      variant="bordered"
                      onChange={handleInputChange}
                      onClear={() => setFormData((prev) => ({ ...prev, location: "" }))}
                      name="location"
                    />
                    <Input
                      isClearable
                      className="w-full ml-4 mt-2"
                      classNames={{
                        base: "border border-2 focus-within:border-black",
                        inputWrapper: "bg-white focus-within:bg-white",
                        input: "bg-white hover:bg-white placeholder:text-black",
                        label: "text-black",
                      }}
                      placeholder="Age"
                      type="text"
                      value={formData.age}
                      variant="bordered"
                      onChange={handleInputChange}
                      onClear={() => setFormData((prev) => ({ ...prev, age: "" }))}
                      name="age"
                    />
                    <Input
                      isClearable
                      className="w-full ml-4 mt-2"
                      classNames={{
                        base: "border border-2 focus-within:border-black",
                        inputWrapper: "bg-white focus-within:bg-white",
                        input: "bg-white hover:bg-white placeholder:text-black",
                        label: "text-black",
                      }}
                      placeholder="Image URL"
                      type="text"
                      value={formData.imageUrl}
                      variant="bordered"
                      onChange={handleInputChange}
                      onClear={() => setFormData((prev) => ({ ...prev, imageUrl: "" }))}
                      name="imageUrl"
                    />
                  </>
                ) : (
                  <>
                    <h4 className="font-bold text-large ml-4 mt-4 text-black">
                      {profile.username || "QuirkyLilSigma"}
                    </h4>
                    <p className="text-sm uppercase font-bold mt-1 ml-4 text-black">
                      {profile.title || "Airman"}
                    </p>
                    <h5 className="text-sm uppercase font-bold mt-0 ml-4 text-black">
                      {profile.location || "Clouds,Sky"}
                    </h5>
                    <h5 className="text-medium mt-0 ml-4 text-black">
                      {profile.age || "18"}
                    </h5>
                  </>
                )}
              </div>
            </CardHeader>
            <CardBody className="overflow-visible py-4 bg-white">
              <div className="ml-2">
                {isEditing ? (
                  <>
                    <Input
                      isClearable
                      className="w-full mb-2"
                      classNames={{
                        base: "border border-2 focus-within:border-black",
                        inputWrapper: "bg-white focus-within:bg-white",
                        input: "bg-white hover:bg-white placeholder:text-black",
                        label: "text-black",
                      }}
                      placeholder="Mood"
                      type="text"
                      value={formData.mood}
                      variant="bordered"
                      onChange={handleInputChange}
                      onClear={() => setFormData((prev) => ({ ...prev, mood: "" }))}
                      name="mood"
                    />
                    <Input
                      isClearable
                      className="w-full mb-2"
                      classNames={{
                        base: "border border-2 focus-within:border-black",
                        inputWrapper: "bg-white focus-within:bg-white",
                        input: "bg-white hover:bg-white placeholder:text-black",
                        label: "text-black",
                      }}
                      placeholder="Status"
                      type="text"
                      value={formData.status}
                      variant="bordered"
                      onChange={handleInputChange}
                      onClear={() => setFormData((prev) => ({ ...prev, status: "" }))}
                      name="status"
                    />
                  </>
                ) : (
                  <>
                    <div className="flex">
                      <p className="text-tiny uppercase font-bold text-black">
                        Mood:
                      </p>
                      <p className="text-tiny uppercase font-bold ml-1 text-black">
                        {profile.mood || "Happy"}
                      </p>
                    </div>
                    <div className="mt-1 flex">
                      <p className="text-tiny uppercase font-bold text-black">
                        Status:
                      </p>
                      <p className="text-tiny uppercase font-bold ml-1 text-black">
                        {profile.status || "Im such a crazy baku sigma"}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="mt-2 ml-2">
                {shouldShowEditButton() && (
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    className="mb-2 bg-white text-black border border-black rounded-md"
                  >
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                )}
                {!shouldShowEditButton() && (
                  <div className="text-sm text-black mb-2">
                    <p>Edit button hidden</p>
                    <p>Reason: canEdit = {String(profile?.canEdit)}</p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          <Card className="py-4 px-1 w-full bg-white">
            <CardHeader className="pb-0 pt-2 px-3 flex items-start">
              <div>
                <p className="text-sm uppercase font-bold mt-1 ml-0 text-black">
                  Social Links
                </p>
              </div>
            </CardHeader>
            <CardBody className="overflow-visible py-1 bg-white">
              {isEditing ? (
                <div className="ml-0">
                  {Object.keys(formData.socialLinks).map((key) => (
                    <Input
                      key={key}
                      isClearable
                      className="w-full mt-2"
                      classNames={{
                        base: "border border-2 focus-within:border-black",
                        inputWrapper: "bg-white focus-within:bg-white",
                        input: "bg-white hover:bg-white placeholder:text-black",
                        label: "text-black",
                      }}
                      placeholder={`${key.charAt(0).toUpperCase() + key.slice(1)} URL`}
                      type="text"
                      value={formData.socialLinks[key]}
                      variant="bordered"
                      onChange={handleInputChange}
                      onClear={() =>
                        setFormData((prev) => ({
                          ...prev,
                          socialLinks: { ...prev.socialLinks, [key]: "" },
                        }))
                      }
                      name={`socialLinks.${key}`}
                    />
                  ))}
                </div>
              ) : (
                <div className="ml-0">
                  {Object.entries(profile.socialLinks || {}).map(
                    ([key, value]) =>
                      value && (
                        <div key={key} className="flex">
                          <p className="text-tiny uppercase font-bold text-black">
                            {key.charAt(0).toUpperCase() + key.slice(1)}:
                          </p>
                          <p className="text-tiny uppercase font-bold ml-1 text-black">
                            {value}
                          </p>
                        </div>
                      ),
                  )}
                </div>
              )}
            </CardBody>
          </Card>

          <Card className="w-full shadow-none h-[80px] bg-white">
            <CardBody className="p-0 overflow-hidden h-full">
              <div className="relative w-full h-full">
                <iframe
                  className="absolute top-0 left-0 w-full rounded-xl"
                  src={
                    profile.socialLinks?.spotify
                      ? profile.socialLinks.spotify.replace(
                          "user/",
                          "embed/track/",
                        ) + "?utm_source=generator&theme=0"
                      : "https://open.spotify.com/embed/track/5p7GiBZNL1afJJDUrOA6C8?utm_source=generator&theme=0"
                  }
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  allowFullScreen
                />
              </div>
            </CardBody>
          </Card>

          <Card className="py-4 px-1 w-full bg-white">
            <CardHeader className="pb-0 pt-2 px-3 flex items-start">
              <div>
                <p className="text-sm uppercase font-bold mt-1 ml-0 text-black">
                  Likes
                </p>
              </div>
            </CardHeader>
            <CardBody className="overflow-visible py-1 bg-white">
              {isEditing ? (
                <Input
                  isClearable
                  className="w-full ml-0"
                  classNames={{
                    base: "border border-2 focus-within:border-black",
                    inputWrapper: "bg-white focus-within:bg-white",
                    input: "bg-white hover:bg-white placeholder:text-black",
                    label: "text-black",
                  }}
                  placeholder="Likes (comma-separated)"
                  type="text"
                  value={formData.likes.join(", ")}
                  variant="bordered"
                  onChange={handleLikesChange}
                  onClear={() => setFormData((prev) => ({ ...prev, likes: [] }))}
                  name="likes"
                />
              ) : (
                <div className="ml-0 flex flex-wrap gap-2">
                  {Array.isArray(profile.likes) && profile.likes.length > 0
                    ? profile.likes.map((like, index) => (
                        <div key={index} className="flex">
                          <h2 className="text-tiny uppercase font-bold text-black bg-white p-1 rounded-full">
                            {like}
                          </h2>
                        </div>
                      ))
                    : ["Spotify", "Music", "Movies", "Gaming"].map(
                        (like, index) => (
                          <div key={index} className="flex">
                            <h2 className="text-tiny uppercase font-bold text-black bg-white p-1 rounded-full">
                              {like}
                            </h2>
                          </div>
                        ),
                      )}
                </div>
              )}
            </CardBody>
          </Card>

          <Card className="py-4 px-1 w-full bg-white">
            <CardHeader className="pb-0 pt-2 px-3 flex items-start">
              <div>
                <p className="text-sm uppercase font-bold mt-1 ml-0 text-black">
                  Post History
                </p>
              </div>
            </CardHeader>
            <CardBody className="overflow-visible py-1 bg-white">
              <div className="ml-0 flex flex-col gap-4">
                {Array.isArray(posts) && posts.length > 0 ? (
                  posts.map((post) => (
                    <PostCard
                      key={post._id}
                      id={post._id}
                      title={post.title || ""}
                      content={post.content || ""}
                      imageUrl={post.imageUrl || ""}
                      username={post.username || profile.username}
                      createdAt={formatTimestamp(post.created_at)}
                      liked={post.liked || false}
                      saved={post.saved || false}
                      likeCount={post.like_count || 0}
                      saveCount={post.save_count || 0}
                      commentCount={post.comment_count || 0}
                      onLike={() => handleLike(post._id)}
                      onSave={() => handleSave(post._id)}
                      onComment={() => handleComment(post._id)}
                      userProfilePic={post.userProfilePic || profile.imageUrl}
                    />
                  ))
                ) : (
                  <div className="flex">
                    <p className="text-tiny uppercase font-bold text-black">
                      No posts yet
                    </p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="sticky top-0 w-full md:w-[25%] ml-auto">
          <Card className="py-4 px-1 w-full mb-4 bg-white">
            <CardHeader className="pb-0 pt-2 px-3 flex items-start">
              <div>
                <h4 className="font-bold text-large ml-4 mt-4 text-black">
                  About me-
                </h4>
              </div>
            </CardHeader>
            <CardBody className="overflow-visible py-4 bg-white">
              <div className="ml-2">
                {isEditing ? (
                  <Textarea
                    isClearable
                    className="w-full"
                    classNames={{
                      base: "border border-2 focus-within:border-black",
                      inputWrapper: "bg-white focus-within:bg-white",
                      input: "bg-white hover:bg-white placeholder:text-black",
                      label: "text-black",
                    }}
                    placeholder="About you"
                    value={formData.aboutyou}
                    variant="bordered"
                    onChange={handleInputChange}
                    onClear={() => setFormData((prev) => ({ ...prev, aboutyou: "" }))}
                    name="aboutyou"
                  />
                ) : (
                  <div className="flex">
                    <p className="text-tiny uppercase font-bold ml-1 text-black">
                      {profile.aboutyou ||
                        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorem suscipit sequi autem libero magni ipsa animi fugiat repudiandae tempore, reiciendis, quibusdam quas ipsam quaerat! Distinctio, omnis placeat quidem voluptates animi modi sequi laudantium beatae sed ea. Harum porro impedit doloremque aliquid quae! Aliquam ipsum tempore provident aspernatur voluptatibus inventore incidunt earum accusamus quidem, vero error animi excepturi eaque labore modi magni dolores accusantium! Doloribus similique cumque dignissimos eveniet fuga eum, sapiente pariatur tenetur cupiditate dolores provident iusto, dolor aspernatur sit amet unde ipsum. Et adipisci rem iste, tempora consequuntur asperiores a incidunt quibusdam quae dolores quasi dignissimos dolorum sed veritatis?"}
                    </p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          <Card className="py-4 px-1 w-full bg-white">
            <CardHeader className="pb-0 pt-2 px-3 flex items-start">
              <div>
                <h4 className="font-bold text-large ml-4 mt-4 text-black">
                  5 things I can yap about-
                </h4>
              </div>
            </CardHeader>
            <CardBody className="overflow-visible py-4 bg-white">
              <div className="ml-2">
                {isEditing ? (
                  <div className="space-y-3">
                    {Object.entries(formData.yapTopics).map(([key, topic]) => (
                      <div key={key} className="space-y-1">
                        <Input
                          isClearable
                          className="w-full"
                          classNames={{
                            base: "border border-2 focus-within:border-black",
                            inputWrapper: "bg-white focus-within:bg-white",
                            input: "bg-white hover:bg-white placeholder:text-black",
                            label: "text-black",
                          }}
                          placeholder={`Topic ${key.slice(-1)} name`}
                          type="text"
                          size="sm"
                          value={topic.name}
                          variant="bordered"
                          onChange={handleInputChange}
                          onClear={() =>
                            setFormData((prev) => ({
                              ...prev,
                              yapTopics: {
                                ...prev.yapTopics,
                                [key]: { ...prev.yapTopics[key], name: "" },
                              },
                            }))
                          }
                          name={`yapTopics.${key}.name`}
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
                          placeholder={`Topic ${key.slice(-1)} description`}
                          value={topic.description}
                          variant="bordered"
                          size="sm"
                          onChange={handleInputChange}
                          onClear={() =>
                            setFormData((prev) => ({
                              ...prev,
                              yapTopics: {
                                ...prev.yapTopics,
                                [key]: { ...prev.yapTopics[key], description: "" },
                              },
                            }))
                          }
                          name={`yapTopics.${key}.description`}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {Object.entries(profile.yapTopics || {}).map(
                      ([key, topic]) =>
                        topic.name && (
                          <div key={key} className="mt-1 flex">
                            <p className="text-tiny uppercase font-bold text-black">
                              {topic.name}:
                            </p>
                            <p className="text-tiny uppercase font-bold ml-1 text-black">
                              {topic.description}
                            </p>
                          </div>
                        ),
                    )}
                    {(!profile.yapTopics ||
                      Object.values(profile.yapTopics).every(
                        (topic) => !topic.name,
                      )) && (
                      <>
                        <div className="flex">
                          <p className="text-tiny uppercase font-bold text-black">
                            Sabrina Carpenter:
                          </p>
                          <p className="text-tiny uppercase font-bold ml-1 text-black">
                            Lorem ipsum dolor sit amet, consectetur adipisicing
                            elit. Ex assumenda, facilis ut nesciunt eos asperiores
                            dolorum quasi! Eum, ratione quae?
                          </p>
                        </div>
                        <div className="mt-1 flex">
                          <p className="text-tiny uppercase font-bold text-black">
                            Ohio:
                          </p>
                          <p className="text-tiny uppercase font-bold ml-1 text-black">
                            Lorem ipsum dolor sit, amet consectetur adipisicing
                            elit. Perspiciatis, ratione! Ullam ab minima, dolorem
                            sequi est mollitia.
                          </p>
                        </div>
                        <div className="mt-1 flex">
                          <p className="text-tiny uppercase font-bold text-black">
                            Breaking Bad:
                          </p>
                          <p className="text-tiny uppercase font-bold ml-1 text-black">
                            Lorem ipsum dolor sit amet consectetur adipisicing
                            elit. Ipsum harum illum rerum necessitatibus iure
                            reprehenderit.
                          </p>
                        </div>
                        <div className="mt-1 flex">
                          <p className="text-tiny uppercase font-bold text-black">
                            Sad:
                          </p>
                          <p className="text-tiny uppercase font-bold ml-1 text-black">
                            Lorem ipsum dolor sit amet consectetur adipisicing
                            elit. A, aut.
                          </p>
                        </div>
                        <div className="mt-1 flex">
                          <p className="text-tiny uppercase font-bold text-black">
                            Beyonce:
                          </p>
                          <p className="text-tiny uppercase font-bold ml-1 text-black">
                            Lorem, ipsum dolor sit amet consectetur adipisicing
                            elit. Optio nihil voluptatum accusamus laborum!
                          </p>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </CardBody>
          </Card>

          {isEditing && (
            <Card className="py-4 px-1 w-full bg-white">
              <CardBody>
                <Button onClick={handleSubmit} className="w-full bg-white text-black border border-black rounded-md">
                  Save Profile
                </Button>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}