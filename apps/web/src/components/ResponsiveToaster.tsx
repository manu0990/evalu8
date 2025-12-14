"use client";

import { useEffect, useState } from "react";
import { Toaster } from "@repo/ui";

export function ResponsiveToaster() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <Toaster
      richColors
      closeButton
      position={isMobile ? "top-center" : "bottom-right"}
    />
  );
}
