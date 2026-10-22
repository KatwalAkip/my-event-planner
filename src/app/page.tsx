"use client";

import React, { useState, useEffect } from "react";
import { EventProvider } from "@/lib/hooks/use-event-store";
import { LandingHero } from "@/components/welcome/landing-hero";
import { AppShell } from "@/components/layout/app-shell";

export default function Home() {
  const [showApp, setShowApp] = useState<boolean>(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const hasStarted = localStorage.getItem("gatherwise_started");
    if (hasStarted === "true") {
      setShowApp(true);
    }
  }, []);

  const handleStartDemo = () => {
    setShowApp(true);
    localStorage.setItem("gatherwise_started", "true");
  };

  const handleBackToWelcome = () => {
    setShowApp(false);
    localStorage.setItem("gatherwise_started", "false");
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#B84E33] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <EventProvider>
      {showApp ? (
        <AppShell onBackToWelcome={handleBackToWelcome} />
      ) : (
        <LandingHero onStartDemo={handleStartDemo} />
      )}
    </EventProvider>
  );
}
