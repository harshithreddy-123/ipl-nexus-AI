import { useEffect, useRef, useState } from "react";

export default function CountUp({ value, duration = 900, formatter }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef();
  const startRef = useRef();

  useEffect(() => {
    const start = performance.now();
    startRef.current = start;
    const from = 0;
    const to = Number(value) || 0;

    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const v = Math.round(from + (to - from) * t);
      setDisplay(v);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  const out = formatter ? formatter(display) : display.toLocaleString();
  return <span>{out}</span>;
}
