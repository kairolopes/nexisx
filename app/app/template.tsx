"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Transição de entrada de página (template re-monta a cada navegação).
 * Discreta e rápida — desativada quando o usuário prefere menos movimento.
 */
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
