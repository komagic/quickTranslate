import React from "react";
import { createRoot } from "react-dom/client";
import { Options } from "./options.tsx";

const container = document.getElementById("app");
if (container) {
  const root = createRoot(container);
  root.render(React.createElement(Options));
}
