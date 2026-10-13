import "./assets/main.css";

import { createElement, StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

const container = document.getElementById("app");
if (!container) throw new Error("#app not found");

createRoot(container).render(createElement(StrictMode, null, createElement(App)));
