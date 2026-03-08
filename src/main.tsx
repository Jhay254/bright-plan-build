import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import SkipToContent from "./components/app/SkipToContent";
import "./i18n";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <>
    <SkipToContent />
    <App />
  </>
);
