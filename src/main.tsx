import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./App.tsx";
import SkipToContent from "./components/app/SkipToContent";
import "./i18n";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <SkipToContent />
    <App />
  </ThemeProvider>
);
