"use client";

import { cn } from "@/utils/cn";
import { AnimatePresence, motion, MotionProps } from "framer-motion";
import React, { useEffect, useState } from "react";

type TextAnimateProps = {
  text: string;
  el?: React.ElementType;
  className?: string;
  delay?: number;
} & MotionProps;

export function TextAnimate({
  text,
  el: Wrapper = "p",
  className,
  delay = 0.03,
  ...props
}: TextAnimateProps) {
  const [displayedText, setDisplayedText] = useState<string[]>([]);

  useEffect(() => {
    const words = text.split(" ");
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < words.length) {
        setDisplayedText((prev) => [...prev, words[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, delay * 1000);

    return () => clearInterval(interval);
  }, [text, delay]);

  return (
    <Wrapper className={className}>
      <AnimatePresence mode="popLayout">
        {displayedText.map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            initial={{ opacity: 0, y: 20, rotateX: -90 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.3,
              delay: index * delay,
            }}
            className="inline-block"
            {...props}
          >
            {word}
            {index < displayedText.length - 1 && "\u00A0"}
          </motion.span>
        ))}
      </AnimatePresence>
    </Wrapper>
  );
}









