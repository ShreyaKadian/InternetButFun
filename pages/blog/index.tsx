import { Avatar, Card, CardHeader, CardBody, Image } from "@heroui/react";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { User, setPersistence, browserLocalPersistence } from "firebase/auth";

import DefaultLayout from "@/layouts/default";
import { title } from "@/components/primitives";
import { HeartIcon, Comments } from "@/components/icons";
import { auth, onAuthStateChanged } from "@/firebase/firebase";
import ErrorPage from "@/components/ErrorPage";

interface UpdateItem {
  _id: string;
  title: string;
  content: string;
  image_url: string | null;
  username: string;
  created_at: string;
  liked: boolean;
  saved: boolean;
  like_count: number;
  comment_count: number;
}

export default function UpdatesPage() {
  const [items, setItems] = useState<UpdateItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const fetchUpdates = useCallback(
    async (pageNum: number) => {
      if (loading || !hasMore || !auth.currentUser) return;
      setLoading(true);
      setError(null);

      try {
        const token = await auth.currentUser.getIdToken(true);

        if (!token) {
          console.log("No auth token found");
          setError("unauthorized");
          setLoading(false);

          return;
        }
        console.log("Auth token:", token);

        const response = await fetch(
          `http://localhost:8000/blog?page=${pageNum}&limit=10`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        console.log("Fetch updates response status:", response.status);

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setError("unauthorized");
          } else if (response.status === 404) {
            setError("notFound");
          } else if (response.status >= 500) {
            setError("serverError");
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          setLoading(false);

          return;
        }

        const data = await response.json();

        console.log("Fetched items:", data);

        if (data.length < 10) setHasMore(false);

        const newItems = data.map((item: any) => ({
          _id: item._id,
          title: item.title,
          content: item.content,
          image_url:
            item.image_url ||
            "https://heroui.com/images/hero-card-complete.jpeg",
          username: item.username,
          created_at: new Date(item.created_at).toLocaleString(),
          liked: item.liked,
          saved: item.saved,
          like_count: item.like_count,
          comment_count: item.comment_count,
        }));

        setItems((prev) => {
          const uniqueItems = newItems.filter(
            (newItem: UpdateItem) =>
              !prev.some((item) => item._id === newItem._id),
          );

          return uniqueItems.length > 0 ? [...prev, ...uniqueItems] : prev;
        });
      } catch (error) {
        console.error("Error fetching updates:", error);
        setError("networkError");
      } finally {
        setLoading(false);
      }
    },
    [loading, hasMore, auth.currentUser],
  );

  const handleLike = async (updateId: string, isLiked: boolean) => {
    if (!auth.currentUser) {
      setError("unauthorized");

      return;
    }

    try {
      const token = await auth.currentUser.getIdToken(true);

      if (!token) {
        console.log("No auth token found for like");
        setError("unauthorized");

        return;
      }
      console.log("Like token:", token);

      const endpoint = isLiked ? "/unlike" : "/like";
      const response = await fetch(
        `http://localhost:8000/updates/${updateId}${endpoint}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        console.log("Like response status:", response.status);
        if (response.status === 401 || response.status === 403) {
          setError("unauthorized");
        } else if (response.status >= 500) {
          setError("serverError");
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return;
      }

      setItems((prev) =>
        prev.map((item) =>
          item._id === updateId
            ? {
                ...item,
                liked: !isLiked,
                like_count: item.like_count + (isLiked ? -1 : 1),
              }
            : item,
        ),
      );
    } catch (error) {
      console.error("Error liking/unliking update:", error);
      setError("networkError");
    }
  };

  const handleRefresh = () => {
    setError(null);
    setPage(1);
    setHasMore(true);
    fetchUpdates(1);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (!user) {
        setError("unauthorized");
      } else {
        setError(null);
        fetchUpdates(page);
      }
    });

    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error("Error setting persistence:", error);
      setError("networkError");
    });

    return () => unsubscribe();
  }, [auth, page, fetchUpdates]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading && hasMore && auth.currentUser) {
          if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = setTimeout(() => {
            setPage((prevPage) => prevPage + 1);
          }, 500);
        }
      },
      { threshold: 0.1, rootMargin: "100px" },
    );

    const currentLoader = loaderRef.current;

    if (currentLoader) observer.observe(currentLoader);

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [loading, hasMore, auth.currentUser]);

  if (error) {
    return (
      <DefaultLayout>
        <section className="flex flex-col items-center gap-6 py-8 md:py-10">
          <h1 className={`${title()} mb-4 text-center`}>Update</h1>
          <ErrorPage errorType={error} />
        </section>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center gap-6 py-8 md:py-10">
        <h1 className={`${title()} mb-4 mt-7 text-center`}>Update</h1>
        <div className="ml-10 flex flex-col gap-5 px-4 w-full items-center">
          {items.length === 0 && !loading ? (
            <div className="text-center py-8">
              <ErrorPage errorType="notFound" />
            </div>
          ) : (
            items.map((item) => (
              <Card key={item._id} className="py-4 w-80">
                <CardHeader className="relative pb-0 pt-2 px-4 flex-col items-start">
                  <div className="flex gap-3 items-center mt-2">
                    <Avatar
                      alt={item.username}
                      src={
                        item.image_url ||
                        "https://i.pravatar.cc/150?u=a042581f4e29026024d"
                      }
                      onError={() => {
                        const img = document.querySelector(
                          `img[src="${item.image_url}"]`,
                        ) as HTMLImageElement;

                        if (img)
                          img.src =
                            "https://i.pravatar.cc/150?u=a042581f4e29026024d";
                      }}
                    />
                    <p className="text-tiny uppercase font-bold">
                      {item.username}
                    </p>
                  </div>
                  <h4 className="font-bold text-large mt-1">{item.title}</h4>
                  <small className="text-default-500 mt-1">
                    {item.content}
                  </small>
                  <div className="absolute top-2 right-4 flex flex-col items-center gap-3">
                    <HeartIcon
                      fill={item.liked ? "red" : "none"}
                      height={35}
                      role="button"
                      style={{ cursor: "pointer" }}
                      tabIndex={0}
                      width={30}
                      onClick={() => handleLike(item._id, item.liked)}
                      onKeyDown={(e: React.KeyboardEvent<SVGSVGElement>) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleLike(item._id, item.liked);
                        }
                      }}
                    />
                    <span>{item.like_count}</span>
                    <Comments height={20} role="img" width={20} />
                    <span>{item.comment_count}</span>
                  </div>
                </CardHeader>
                <CardBody className="overflow-visible py-2">
                  <Image
                    alt={item.title}
                    className="object-cover rounded-xl w-full h-auto"
                    src={
                      item.image_url ||
                      "https://heroui.com/images/hero-card-complete.jpeg"
                    }
                    onError={() => {
                      const img = document.querySelector(
                        `img[src="${item.image_url}"]`,
                      ) as HTMLImageElement;

                      if (img)
                        img.src =
                          "https://heroui.com/images/hero-card-complete.jpeg";
                    }}
                  />
                </CardBody>
              </Card>
            ))
          )}
        </div>
        <div ref={loaderRef} className="h-10 w-full" />
        {loading && <p className="text-center">...</p>}
      </section>
    </DefaultLayout>
  );
}
