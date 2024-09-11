"use server";

import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import * as fontkit from "fontkit";
import * as apis from "googleapis";
import { join, parse } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import fetch from "node-fetch";
import consola from "consola";
import * as React from "react";

const fontApi = new apis.webfonts_v1.Webfonts({
  auth: "AIzaSyCZkjW4Dh2fr7P-3BMthkW40KaQxoNpmi4",
});

const logger = consola.withTag("server");

// 定义预览图尺寸
const WIDTH = 4000; // 增加宽度以提高清晰度
const HEIGHT = 1440; // 增加高度以提高清晰度
const PADDING = 40; // 添加内边距

interface FontPreviewInput {
  family: string;
  text: string;
  width?: number;
  height?: number;
  textColor?: string;
  backgroundColor?: string;
}

async function drawImage(fontFamily: string, input: FontPreviewInput) {
  const width = input.width ?? WIDTH;
  const height = input.height ?? HEIGHT;
  const textColor = input.textColor ?? "#333333";
  const backgroundColor = input.backgroundColor ?? "#f0f0f0";

  const font = fontkit.openSync(
    join(process.cwd(), "temp", `${fontFamily}.ttf`)
  ) as fontkit.Font;
  const displayName =
    font.getName("fullName", "en") ||
    font.getName("fullName", "zh") ||
    parse(fontFamily).name;
  const familyName =
    font.getName("familyName", "en") ||
    font.getName("familyName", "zh") ||
    parse(fontFamily).name;

  logger.info("familyName is :", familyName);

  // 增加画布尺寸以提高清晰度
  const scale = 4;
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;
  const canvas = createCanvas(scaledWidth, scaledHeight);
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  const measureText = (text: string, fontSize: number) => {
    ctx.font = `${fontSize}px "${familyName}"`;
    return ctx.measureText(text);
  };

  const maxWidth = width - 2 * PADDING;
  const maxHeight = height - 2 * PADDING;
  let fontSize = Math.min(maxWidth, maxHeight);
  let textMetrics = measureText(displayName, fontSize);

  while (
    textMetrics.width > maxWidth ||
    textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent >
      maxHeight
  ) {
    fontSize *= 0.9;
    textMetrics = measureText(displayName, fontSize);
  }

  ctx.font = `${fontSize}px "${familyName}"`;
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(input.text, width / 2, height / 2);

  const buffer = await canvas.encode("png");

  logger.success(`已生成 ${displayName} 的预览图`);

  return buffer;
}

export const Canvas = async (input: FontPreviewInput) => {
  if (!input || !input.family) return null;
  const data = await fontApi.webfonts.list({
    family: [decodeURIComponent(input.family)],
  });
  const font = data.data.items![0];
  const fontUrl = font.files!.regular;

  // 下载字体文件
  const fontResponse = await fetch(fontUrl);
  const fontBuffer = await fontResponse.arrayBuffer();

  // 保存字体文件到临时目录
  const tempDir = join(process.cwd(), "temp");
  await mkdir(tempDir, { recursive: true });
  const fontPath = join(tempDir, `${font.family}.ttf`);
  await writeFile(fontPath, Buffer.from(fontBuffer));

  // 注册字体
  GlobalFonts.registerFromPath(
    join(process.cwd(), "temp", `${font.family!}.ttf`),
    font.family!
  );

  const imageBuffer = await drawImage(font.family!, input);
  const base64Image = Buffer.from(imageBuffer).toString("base64");
  const src = `data:image/png;base64,${base64Image}`;
  return (
    <img
      alt="preview"
      src={src}
      width={input.width ?? WIDTH}
      height={input.height ?? HEIGHT}
    />
  );
};
