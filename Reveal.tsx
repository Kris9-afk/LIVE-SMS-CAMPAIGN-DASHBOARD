import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

export default function Reveal({
  i = 0,
  className,
  children,
}: {
  i?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.07 * i, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
