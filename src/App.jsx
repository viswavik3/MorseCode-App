import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import MorseInputPage from "./pages/MorseInputPage";
import ReferencePage from "./pages/ReferencePage";
import ReversePage from "./pages/ReversePage";
import { ThemeProvider } from "./components/ThemeProvider";

export default function App() {
  return (
    <ThemeProvider>
      <AppShell>
        <Routes>
          <Route path="/" element={<MorseInputPage />} />
          <Route path="/reverse" element={<ReversePage />} />
          <Route path="/reference" element={<ReferencePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </ThemeProvider>
  );
}
