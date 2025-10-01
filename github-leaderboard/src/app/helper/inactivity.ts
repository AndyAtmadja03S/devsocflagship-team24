import { useEffect, useState } from "react";

export function useInactivity(timeoutMs: number) {
  const [isInactive, setInactive] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timer);
      setInactive(false);
      timer = setTimeout(() => setInactive(true), timeoutMs);
    };

    // listen to user events
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("mousedown", resetTimer);
    window.addEventListener("touchstart", resetTimer);

    resetTimer(); // start timer

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("mousedown", resetTimer);
      window.removeEventListener("touchstart", resetTimer);
    };
  }, [timeoutMs]);

  return isInactive;
}
