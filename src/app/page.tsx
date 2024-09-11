import dynamic from "next/dynamic";

const FontList = dynamic(() => import("./font-list"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="text-center mx-auto text-gray-700 p-4">
      <h1 className="text-2xl font-bold mb-4">字体列表</h1>
      <FontList />
    </main>
  );
}
