import React, { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardBody, Image, Button } from "@heroui/react";
import { getAuth } from "firebase/auth";

import DefaultLayout from "@/layouts/default";
import { title } from "@/components/primitives";
import { PLusbutton } from "@/components/icons";
import ErrorPage from "@/components/ErrorPage";

// Extend @heroui/react types to fix onError prop for Image
declare module "@heroui/react" {
  interface ImageProps {
    onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  }
}

interface Item {
  _id: string;
  title: string;
  content: string;
  url: string;
  date: string;
  author: string;
}

export default function NewsPage() {
  const auth = getAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Function to get Firebase auth token
  const getAuthToken = async (): Promise<string | null> => {
    try {
      const user = auth.currentUser;

      if (user) {
        const token = await user.getIdToken(true); // Force refresh

        console.log("Auth token:", token); // Debug log

        return token;
      }
      console.log("No user logged in");

      return null;
    } catch (error) {
      console.error("Error getting auth token:", error);

      return null;
    }
  };

  // Fetch news from backend
  const fetchNews = async (isInitial: boolean = false) => {
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

      const response = await fetch(
        `http://localhost:8000/news?page=${page}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        console.log("Response status:", response.status); // Debug log
        if (response.status === 404) {
          setError("notFound");
        } else if (response.status >= 500) {
          setError("serverError");
        } else if (response.status === 401 || response.status === 403) {
          setError("unauthorized");
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return;
      }

      const newItems: Item[] = await response.json();

      console.log("Fetched items:", newItems); // Debug log

      if (isInitial) {
        setItems(newItems);
      } else {
        setItems((prev) => {
          const uniqueItems = newItems.filter(
            (newItem) => !prev.some((item) => item._id === newItem._id),
          );

          return [...prev, ...uniqueItems];
        });
      }

      if (newItems.length < 10) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      setError("networkError");
    } finally {
      setLoading(false);
    }
  };

  // Load news on mount and when page changes
  useEffect(() => {
    fetchNews(true);
  }, []);

  useEffect(() => {
    if (page > 1) {
      fetchNews();
    }
  }, [page]);

  // Set up IntersectionObserver for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.3 },
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasMore, loading]);

  // Handle refresh
  const handleRefresh = () => {
    setPage(1);
    setHasMore(true);
    setError(null);
    fetchNews(true);
  };

  const getHoursAgo = (dateStr: string) => {
    const now = new Date();
    const then = new Date(dateStr);
    const diffMs = now.getTime() - then.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    return `${diffHours} hours ago`;
  };

  const toggleExpand = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  if (error) {
    return (
      <DefaultLayout>
        <section className="flex flex-col items-center gap-6 py-8 md:py-10">
          <div className="text-center">
            <h1 className={title()}>News</h1>
          </div>
          <ErrorPage errorType={error} />
        </section>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <section className="flex flex-col gap-10 py-8 md:py-10">
        <div className="ml-52 mt-4">
          <h1 className={title()}>News</h1>
        </div>
        <div className="flex flex-col gap-6 ml-16 w-full px-4">
          {items.length === 0 && !loading ? (
            <div className="text-center py-8">
              <ErrorPage errorType="notFound" />
            </div>
          ) : (
            items.map((item) => (
              <Card key={item._id} className="px-2 py-4 w-[27rem] h-auto">
                <CardHeader className="pb-0 pt-2 px-4 flex-col items-start relative">
                  <div className="absolute top-2 right-2">
                    <Button
                      className="p-1"
                      onClick={() => toggleExpand(item._id)}
                    >
                      <PLusbutton height={20} width={20} />
                    </Button>
                  </div>
                  <h4 className="font-semibold text-large mb-1">
                    {item.title}
                  </h4>
                  <small className="text-default-500">{item.author}</small>
                  <small className="text-default-500">
                    {getHoursAgo(item.date)}
                  </small>
                </CardHeader>
                <CardBody className="overflow-visible py-2">
                  <Image
                    alt={item.title}
                    className="object-cover rounded-xl w-full h-[23.5rem]"
                    src={
                      item.url ||
                      "https://heroui.com/images/hero-card-complete.jpeg"
                    }
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.src =
                        "https://heroui.com/images/hero-card-complete.jpeg";
                    }}
                  />
                  {expandedItem === item._id && (
                    <p className="mt-2 text-small">{item.content}</p>
                  )}
                </CardBody>
              </Card>
            ))
          )}
        </div>
        <div ref={loaderRef} className="h-10 w-full" />
      </section>
    </DefaultLayout>
  );
}
