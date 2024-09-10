/* @refresh reload */
import { render } from "solid-js/web";

import "./src/index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { Routes } from "./src/routes";
import "solid-devtools";

const queryClient = new QueryClient();

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?"
  );
}

render(
  () => (
    <QueryClientProvider client={queryClient}>
      <Routes />
    </QueryClientProvider>
  ),
  root!
);
