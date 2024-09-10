import { createEffect, createSignal } from "solid-js";
import { useParams } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import { debounce } from "radash";
import {
  TextFieldRoot,
  TextFieldLabel,
  TextField,
} from "@/components/ui/textfield";

const fetchPreviewImage = async (params: Record<string, any>) => {
  const response = await fetch(`/api/font`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

const PreviewPage = () => {
  const params = useParams();
  const [text, setText] = createSignal("");
  const [width, setWidth] = createSignal(300);
  const [height, setHeight] = createSignal(100);
  const [language, setLanguage] = createSignal(navigator.language);
  const [textColor, setTextColor] = createSignal("#333333");
  const [backgroundColor, setBackgroundColor] = createSignal("#f0f0f0");

  createEffect(() => {
    setLanguage(navigator.language);
  });

  const debouncedSetText = debounce({ delay: 300 }, setText);
  const debouncedSetWidth = debounce({ delay: 300 }, (value: number) => setWidth(value));
  const debouncedSetHeight = debounce({ delay: 300 }, (value: number) => setHeight(value));
  const debouncedSetTextColor = debounce({ delay: 300 }, setTextColor);
  const debouncedSetBackgroundColor = debounce({ delay: 300 }, setBackgroundColor);

  const query = createQuery(() => ({
    queryKey: [
      "previewImage",
      text(),
      params.font,
      width(),
      height(),
      textColor(),
      backgroundColor(),
    ],
    queryFn: () =>
      fetchPreviewImage({
        family: params.font,
        text: text(),
        width: width(),
        height: height(),
        textColor: textColor(),
        backgroundColor: backgroundColor(),
      }),
    enabled: !!text(),
  }));

  const handleDownload = () => {
    if (query.data) {
      const link = document.createElement('a');
      link.href = query.data;
      link.download = `${params.font}_preview.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">字体预览: {params.font}</h1>
      <div class="space-y-6">
        <TextFieldRoot>
          <TextFieldLabel for="preview-text">预览文本</TextFieldLabel>
          <TextField
            id="preview-text"
            type="text"
            value={text()}
            onInput={(e: any) => debouncedSetText(e.currentTarget.value)}
            placeholder="请输入要预览的文本"
          />
        </TextFieldRoot>

        <div class="grid grid-cols-2 gap-4">
          <TextFieldRoot>
            <TextFieldLabel for="width">宽度</TextFieldLabel>
            <TextField
              id="width"
              type="number"
              value={width()}
              onInput={(e: any) => debouncedSetWidth(parseInt(e.currentTarget.value))}
              placeholder="宽度"
            />
          </TextFieldRoot>
          <TextFieldRoot>
            <TextFieldLabel for="height">高度</TextFieldLabel>
            <TextField
              id="height"
              type="number"
              value={height()}
              onInput={(e: any) => debouncedSetHeight(parseInt(e.currentTarget.value))}
              placeholder="高度"
            />
          </TextFieldRoot>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <TextFieldRoot>
            <TextFieldLabel for="text-color">文本颜色</TextFieldLabel>
            <TextField
              id="text-color"
              type="color"
              class="w-12"
              value={textColor()}
              onInput={(e: any) => debouncedSetTextColor(e.currentTarget.value)}
            />
          </TextFieldRoot>
          <TextFieldRoot>
            <TextFieldLabel for="bg-color">背景颜色</TextFieldLabel>
            <TextField
              id="bg-color"
              type="color"
              class="w-12"
              value={backgroundColor()}
              onInput={(e: any) => debouncedSetBackgroundColor(e.currentTarget.value)}
            />
          </TextFieldRoot>
        </div>
      </div>
      <div class="mt-4">
        {query.isLoading && <p class="text-gray-600">加载中...</p>}
        {query.isError && (
          <p class="text-red-500">加载失败: {query.error.message}</p>
        )}
        {query.isSuccess && (
          <div>
            <img
              src={query.data}
              alt="文本预览"
              class="border rounded shadow-md mb-4"
              style={`width: ${width()}px; height: ${height()}px;`}
            />
            <button
              onClick={handleDownload}
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              下载预览图像
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewPage;
