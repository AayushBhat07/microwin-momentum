import { motion } from "framer-motion";
import { Award } from "lucide-react";

export const Badge = ({ icon: Icon = Award, name, color, delay = 0 }: { icon?: React.ElementType, name: string, color: string, delay?: number }) => (
  <motion.div
    className="flex flex-col items-center text-center gap-2"
    initial={{ opacity: 0, scale: 0.5 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ type: "spring", stiffness: 100, delay }}
    viewport={{ once: true }}
  >
    <motion.div
      className="w-24 h-24 rounded-full flex items-center justify-center shadow-inner"
      style={{ backgroundColor: color }}
      whileHover={{ scale: 1.1, rotate: 5 }}
    >
      <Icon className="w-12 h-12 text-ink" />
    </motion.div>
    <p className="font-bold text-sm">{name}</p>
  </motion.div>
);
