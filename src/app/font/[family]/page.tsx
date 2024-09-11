"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { throttle } from "radash";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

const fetchPreviewImage = async (params: Record<string, any>) => {
  const response = await fetch(`/font`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export default function PreviewPage() {
  const { family: fontFamily } = useParams();
  const [text, setText] = useState("");
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(100);
  const [textColor, setTextColor] = useState("#333333");
  const [backgroundColor, setBackgroundColor] = useState("#f0f0f0");
  const font = decodeURIComponent(fontFamily.toString());

  useEffect(() => {
    setText(font as string);
  }, [font]);

  const throttledSetText = throttle({ interval: 300 }, setText);
  const throttledSetWidth = throttle({ interval: 300 }, (value: number) =>
    setWidth(value)
  );
  const throttledSetHeight = throttle({ interval: 300 }, (value: number) =>
    setHeight(value)
  );
  const throttledSetTextColor = throttle({ interval: 300 }, setTextColor);
  const throttledSetBackgroundColor = throttle(
    { interval: 300 },
    setBackgroundColor
  );

  const {
    data: imageUrl,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "previewImage",
      text,
      font,
      width,
      height,
      textColor,
      backgroundColor,
    ],
    queryFn: () =>
      fetchPreviewImage({
        family: font,
        text,
        width,
        height,
        textColor,
        backgroundColor,
      }),
    enabled: !!text,
  });

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `${font}_preview.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">字体预览: {font}</h1>
      <div className="space-y-6">
        <div className="space-y-6">
          {/* 添加输入字段 */}
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="text">预览文本</Label>
            <Input
              type="text"
              id="text"
              value={text}
              onChange={(e) => throttledSetText(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="width">宽度</Label>
              <Input
                type="number"
                id="width"
                value={width}
                onChange={(e) => throttledSetWidth(Number(e.target.value))}
              />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="height">高度</Label>
              <Input
                type="number"
                id="height"
                value={height}
                onChange={(e) => throttledSetHeight(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="textColor">文本颜色</Label>
              <Input
                type="color"
                id="textColor"
                value={textColor}
                onChange={(e) => throttledSetTextColor(e.target.value)}
              />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="backgroundColor">背景颜色</Label>
              <Input
                type="color"
                id="backgroundColor"
                value={backgroundColor}
                onChange={(e) => throttledSetBackgroundColor(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4">
        {isLoading && <p className="text-gray-600">加载中...</p>}
        {isError && <p className="text-red-500">加载失败: {error.message}</p>}
        {imageUrl && (
          <div>
            <Image
              src={imageUrl}
              alt="文本预览"
              className="border rounded shadow-md mb-4"
              width={width}
              height={height}
            />
            <button
              onClick={handleDownload}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              下载预览图像
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
