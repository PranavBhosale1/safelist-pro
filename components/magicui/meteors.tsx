"use client";

import { cn } from "@/utils/cn";
import { useEffect, useState } from "react";

export const Meteors = ({
  number = 20,
  className,
}: {
  number?: number;
  className?: string;
}) => {
  const [meteors, setMeteors] = useState<Array<{ id: number; left: string; delay: number; duration: number; size: number }>>([]);

  useEffect(() => {
    const meteorArray = Array.from({ length: number }, (_, i) => ({
      id: i,
      left: Math.floor(Math.random() * (400 - -400) + -400) + "px",
      delay: Math.random() * 0.6,
      duration: Math.random() * 0.6 + 0.4,
      size: Math.random() * 2 + 1,
    }));
    setMeteors(meteorArray);
  }, [number]);

  return (
    <>
      {meteors.map((meteor) => (
        <span
          key={meteor.id}
          className={cn(
            "animate-meteor-effect absolute top-1/2 left-1/2 h-0.5 w-0.5 rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10] rotate-[215deg]",
            "before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-[50%] before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-[#64748b] before:to-transparent",
            className
          )}
          style={{
            top: "0",
            left: meteor.left,
            animationDelay: meteor.delay + "s",
            animationDuration: meteor.duration + "s",
            width: meteor.size + "px",
            height: meteor.size + "px",
          }}
        />
      ))}
    </>
  );
};



