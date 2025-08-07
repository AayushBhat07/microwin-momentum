import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import React from "react";

export const PillCTA = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
    <Button size="lg" className={`rounded-full font-bold text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all ${className}`}>
      {children}
    </Button>
  </motion.div>
);
