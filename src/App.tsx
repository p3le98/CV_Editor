import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "./components/LandingPage";
import { ResumeEditor } from "./components/resume/ResumeEditor";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Laden...</div>}>
      <>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/editor" element={<ResumeEditor />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </>
    </Suspense>
  );
}

export default App;
