'use client';

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
  const [showPostImage, setShowPostImage] = useState(false);

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
    if (imageUrl) {
      setShowPostImage(!showPostImage);
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

  return (
    <Card isBlurred className="bg-[#FFFCE1] w-2/3 font-sans shadow-xl">
      <CardBody className="p-6">
        <div className="flex flex-col md:flex-row gap-1 items-start">
          {/* Image Section */}
          <div className="flex-shrink-0 w-full md:w-44">
            <Image
              alt={showPostImage ? "Post image" : "User profile"}
              className="object-cover rounded-xl w-full h-48 md:h-40"
              src={
                showPostImage && imageUrl
                  ? imageUrl
                  : userProfilePic || "https://heroui.com/images/album-cover.png"
              }
            />
          </div>

          {/* Content Section */}
          <div className="flex flex-col justify-between flex-1 min-w-0">
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <h3 className="font-semibold text-foreground/90 text-sm">
                  {username}
                </h3>
                <h1 className="text-lg font-medium leading-tight break-words">
                  {title}
                </h1>
                <p className="text-sm text-foreground/80 break-words">
                  {limitedText}
                </p>
              </div>
              <Button
                isIconOnly
                className={clsx(
                  "text-default-900/60 data-[hover]:bg-foreground/10 ml-2 flex-shrink-0 transition-colors",
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

            {/* Action Buttons */}
            <div className="flex items-center gap-1 mt-auto relative">
              {/* Save */}
              <Button
                isIconOnly
                variant="light"
                radius="full"
                onClick={onSave}
                className="flex-shrink-0"
              >
                {saved ? <FullButton /> : <SaveButton />}
              </Button>

              {/* Comments Button */}
              <div className="relative">
                <Button
                  isIconOnly
                  variant="light"
                  radius="full"
                  className="flex-shrink-0"
                  onClick={() => toggleTooltip("comment")}
                >
                  <Comments />
                </Button>
                {showTooltip.comment && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-[#333] font-medium px-4 py-2 rounded-xl shadow-lg border border-gray-200 z-50 w-36 text-sm">
                     coming soon!💫
                  </div>
                )}
              </div>

              {/* Plus (Toggle Image) */}
              <Button
                isIconOnly
                variant="light"
                radius="full"
                className="flex-shrink-0"
                onClick={handlePlusClick}
                disabled={!imageUrl}
              >
                <PLusbutton size={24} />
              </Button>

              {/* Share Button */}
              <div className="relative">
                <Button
                  isIconOnly
                  variant="light"
                  radius="full"
                  className="flex-shrink-0"
                  onClick={() => toggleTooltip("share")}
                >
                  <ShareButton />
                </Button>
                {showTooltip.share && (
                  <div className="absolute w-36 text-sm -top-10 left-1/2 -translate-x-1/2 bg-white text-[#333]  font-medium px-4 py-2 rounded-xl shadow-lg border border-gray-200 z-50">
                     coming soon!💫
                  </div>
                )}
              </div>

              {/* More Button */}
              <div className="relative">
                <Button
                  isIconOnly
                  variant="light"
                  radius="full"
                  className="flex-shrink-0"
                  onClick={() => toggleTooltip("more")}
                >
                  <More />
                </Button>
                {showTooltip.more && (
                  <div className="absolute w-36 text-sm -top-10 left-1/2 -translate-x-1/2 bg-white text-[#333] font-medium px-4 py-2 rounded-xl shadow-lg border border-gray-200 z-50 ">
                     coming soon!💫
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-2 text-xs text-foreground/60">
              <span>{likeCount} likes</span>
              <span>{saveCount} saves</span>
              <span>{commentCount} comments</span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
