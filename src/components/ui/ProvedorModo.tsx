"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import { useModoLeve } from "@/src/lib/modoSite";

/**
 * Envolve o site todo. No modo leve (e enquanto a pessoa não escolheu), todas as animações do framer-motion
 * viram instantâneas e sem movimento: o conteúdo só aparece no lugar, sem animar.
 */
export default function ProvedorModo({ children }: { children: ReactNode }) {
  const leve = useModoLeve();
  return (
    <MotionConfig reducedMotion={leve ? "always" : "user"} transition={leve ? { duration: 0 } : undefined}>
      {children}
    </MotionConfig>
  );
}