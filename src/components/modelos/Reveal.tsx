"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useMovimentoReduzido } from "@/src/lib/modoSite";

/** Faz o bloco aparecer suavemente quando entra na tela. Respeita "reduzir movimento" e o modo leve. */
export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useMovimentoReduzido();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}