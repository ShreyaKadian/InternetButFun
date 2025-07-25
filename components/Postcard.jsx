"use client";

import React, { useState } from "react";
import { Card, CardBody, Image, Button } from "@heroui/react";
import clsx from "clsx";

import {
  HeartIcon,
  ShareButton,
  PLusbutton,
  More,
  Comments,
  SaveButton,
  FullButton,
} from "./icons";

export default function PostCard({
  id,
  title,
  content,
  imageUrl,
  username,
  createdAt,
  liked,
  saved,
  likeCount,
  saveCount,
  commentCount,
  onLike,
  onSave,
  onComment,
  userProfilePic,
}) {
  const [showPostImage, setShowPostImage] = useState(true); 
  const [imageError, setImageError] = useState(false);

  const [showTooltip, setShowTooltip] = useState({
    comment: false,
    share: false,
    more: false,
  });

  const wordLimit = 50;
  const safeContent = content || "";
  const limitedText =
    safeContent.split(" ").slice(0, wordLimit).join(" ") +
    (safeContent.split(" ").length > wordLimit ? "..." : "");

  const handlePlusClick = () => {
    if (userProfilePic) {
      setShowPostImage((prev) => !prev);
    }
  };

  const toggleTooltip = (key) => {
    setShowTooltip((prev) => ({
      comment: false,
      share: false,
      more: false,
      [key]: !prev[key],
    }));

    setTimeout(() => {
      setShowTooltip((prev) => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const getImageSource = () => {
    if (showPostImage && imageUrl) {
      return imageUrl;
    }

    if (userProfilePic && !imageError) {
      return userProfilePic;
    }

    return "https://placehold.co/150x150?text=Profile";
  };

  const handleImageError = (e) => {
    console.log("Image failed to load:", e.currentTarget.src);
    setImageError(true);
    e.currentTarget.src = "https://placehold.co/150x150?text=Profile";
  };

  return (
    <Card className="w-[30rem] font-sans shadow-xl bg-white text-black">
      <CardBody className="p-4">
        <div className="flex flex-col md:flex-row gap-1 items-start">
          <div className="flex-shrink-0 w-full md:w-44">
            <Image
              alt={showPostImage ? "Post image" : "User profile"}
              className="object-cover rounded-xl w-full h-48 md:h-40"
              src={getImageSource()}
              onError={handleImageError}
            />
          </div>

          <div className="flex flex-col justify-between flex-1 min-w-0 pl-3">
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <h3 className="font-semibold text-black text-sm">
                  {username}
                </h3>
                <h1 className="text-lg font-medium leading-tight break-words text-black">
                  {title}
                </h1>
                <p className="text-sm text-black break-words">
                  {limitedText}
                </p>
              </div>
              <Button
                isIconOnly
                className={clsx(
                  "text-black data-[hover]:bg-black/10 ml-2 flex-shrink-0 transition-colors",
                  liked ? "text-black" : ""
                )}
                radius="full"
                variant="light"
                onClick={onLike}
              >
                <HeartIcon
                  className={liked ? "[&>path]:stroke-transparent" : ""}
                  fill={liked ? "currentColor" : "none"}
                />
              </Button>
            </div>

            <div className="flex items-center gap-1 mt-auto relative mt-5">
              <Button
                isIconOnly
                variant="light"
                radius="full"
                onClick={onSave}
                className="flex-shrink-0 text-black"
              >
                {saved ? <FullButton /> : <SaveButton />}
              </Button>

              <div className="relative">
                <Button
                  isIconOnly
                  variant="light"
                  radius="full"
                  className="flex-shrink-0 text-black"
                  onClick={() => toggleTooltip("comment")}
                >
                  <Comments />
                </Button>
                {showTooltip.comment && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black font-medium px-4 py-2 rounded-xl shadow-lg border border-gray-200 z-50 w-36 text-sm">
                    coming soon!💫
                  </div>
                )}
              </div>

              <Button
                isIconOnly
                variant="light"
                radius="full"
                className="flex-shrink-0 text-black"
                onClick={handlePlusClick}
                disabled={!userProfilePic}
              >
                <PLusbutton size={24} />
              </Button>

              <div className="relative">
                <Button
                  isIconOnly
                  variant="light"
                  radius="full"
                  className="flex-shrink-0 text-black"
                  onClick={() => toggleTooltip("share")}
                >
                  <ShareButton />
                </Button>
                {showTooltip.share && (
                  <div className="absolute w-36 text-sm -top-10 left-1/2 -translate-x-1/2 bg-white text-black font-medium px-4 py-2 rounded-xl shadow-lg border border-gray-200 z-50">
                    coming soon!💫
                  </div>
                )}
              </div>

              <div className="relative">
                <Button
                  isIconOnly
                  variant="light"
                  radius="full"
                  className="flex-shrink-0 text-black"
                  onClick={() => toggleTooltip("more")}
                >
                  <More />
                </Button>
                {showTooltip.more && (
                  <div className="absolute w-36 text-sm -top-10 left-1/2 -translate-x-1/2 bg-white text-black font-medium px-4 py-2 rounded-xl shadow-lg border border-gray-200 z-50">
                    coming soon!💫
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 mt-0 text-[0.7rem] text-black ml-1">
              <span>{likeCount} likes</span>
              <span>{saveCount} saves</span>
              {/* <span>{commentCount} comments</span> */}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
