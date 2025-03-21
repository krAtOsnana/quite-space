'use client'
import { motion } from "framer-motion";
import { SunIcon, MoonIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button 
    variant='outline'
    onClick={() => setTheme(isDark ? "light" : "dark")} className="relative w-10 h-10">
      {/* Sun Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: isDark ? 0 : 1, scale: isDark ? 0 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="absolute"
      >
        <SunIcon className="h-[1.2rem] w-[1.2rem]" />
      </motion.div>

      {/* Moon Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: isDark ? 1 : 0, scale: isDark ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <MoonIcon className="h-[1.2rem] w-[1.2rem]" />
      </motion.div>
    </Button>
  );
}
