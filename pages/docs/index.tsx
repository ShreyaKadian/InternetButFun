import React, { useEffect, useRef, useState } from "react";
import { auth } from "../../firebase/firebase";
import PostCard from "@/components/Postcard";
import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { Navbar2 } from "@/components/navbar2";
import ErrorPage from "@/components/ErrorPage";

interface Post {
  _id: string;
  title: string;
  content: string;
  image_url?: string;
  username: string;
  user_id: string;
  created_at: string;
  liked: boolean;
  saved: boolean;
  like_count: number;
  save_count: number;
  comment_count: number;
  likes: string[];
  saves: string[];
  comments: Comment[];
  userProfilePic?: string;
}

interface Comment {
  comment_id: string;
  user_id: string;
  username: string;
  content: string;
  timestamp: string;
}

export default function DocsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const getAuthToken = async (): Promise<string | null> => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        console.log("Token fetched:", token ? token.substring(0, 10) + "..." : "No token");
        return token;
      }
      return null;
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  };

  const loadPosts = async (isInitial: boolean = false) => {
    if (loading || (!hasMore && !isInitial)) return;

    setLoading(true);
    setError(null);

    try {
      const token = await getAuthToken();
      if (!token) {
        setError("unauthorized");
        setLoading(false);
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const cleanApiUrl = API_URL.replace(/\/+$/, "");
      const fetchUrl = `${cleanApiUrl}/posts`;
      console.log("Fetching from:", fetchUrl);
      const response = await fetch(fetchUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError("notFound");
        } else if (response.status >= 500) {
          setError("serverError");
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return;
      }

      const newPosts: Post[] = await response.json();
      if (isInitial) {
        setPosts(newPosts);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...newPosts]);
      }
      if (newPosts.length < 10) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading posts:", error);
      setError("networkError");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(true);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) {
          loadPosts(false);
        }
      },
      { threshold: 1.0 },
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) observer.observe(currentLoader);

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [hasMore, loading]);

  const handleLike = async (postId: string) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        setError("unauthorized");
        return;
      }

      const post = posts.find((p) => p._id === postId);
      if (!post) {
        setError("notFound");
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const cleanApiUrl = API_URL.replace(/\/+$/, "");
      const endpoint = post.liked ? "unlike" : "like";
      const response = await fetch(`${cleanApiUrl}/posts/${postId}/${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p._id === postId
              ? {
                  ...p,
                  liked: !p.liked,
                  like_count: p.liked ? p.like_count - 1 : p.like_count + 1,
                }
              : p,
          ),
        );
      } else {
        setError("serverError");
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      setError("networkError");
    }
  };

  const handleSave = async (postId: string) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        setError("unauthorized");
        return;
      }

      const post = posts.find((p) => p._id === postId);
      if (!post) {
        setError("notFound");
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const cleanApiUrl = API_URL.replace(/\/+$/, "");
      const endpoint = post.saved ? "unsave" : "save";
      const response = await fetch(`${cleanApiUrl}/posts/${postId}/${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p._id === postId
              ? {
                  ...p,
                  saved: !p.saved,
                  save_count: p.saved ? p.save_count - 1 : p.save_count + 1,
                }
              : p,
          ),
        );
      } else {
        setError("serverError");
      }
    } catch (error) {
      console.error("Error toggling save:", error);
      setError("networkError");
    }
  };

  const handleComment = async (postId: string, commentContent: string) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        setError("unauthorized");
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const cleanApiUrl = API_URL.replace(/\/+$/, "");
      const response = await fetch(`${cleanApiUrl}/posts/${postId}/comment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: commentContent }),
      });

      if (response.ok) {
        loadPosts(true);
      } else {
        setError("serverError");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      setError("networkError");
    }
  };

  const handleRefresh = () => {
    setHasMore(true);
    setError(null);
    loadPosts(true);
  };

  if (error) {
    return (
      <DefaultLayout>
        <section className="flex flex-col items-center gap-6 py-8 md:py-10">
          <div className="text-center">
            <h1 className={`${title()} text-black mt-12`}>News</h1>
          </div>
          <ErrorPage errorType={error} />
        </section>
        <Navbar2 />
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <section className="flex flex-col w-[53rem] ml-8 gap-6 py-8 md:py-10">
        <h1 className={`${title()} text-black ml-32 mt-4`}>Posts</h1>
        <div className="flex flex-col gap-6 w-full px-4 mt-2">
          {posts.length === 0 && !loading ? (
            <div className="text-center py-8">
              <ErrorPage errorType="notFound" />
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                commentCount={post.comment_count}
                content={post.content}
                createdAt={post.created_at}
                id={post._id}
                imageUrl={post.image_url}
                likeCount={post.like_count}
                liked={post.liked}
                saveCount={post.save_count}
                saved={post.saved}
                title={post.title}
                userProfilePic={post.userProfilePic}
                username={post.username}
                onComment={(content: string) => handleComment(post._id, content)}
                onLike={() => handleLike(post._id)}
                onSave={() => handleSave(post._id)}
              />
            ))
          )}
        </div>
        <div ref={loaderRef} className="h-10 w-full" />
      </section>
      <Navbar2 />
    </DefaultLayout>
  );
}