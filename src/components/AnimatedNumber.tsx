import { useEffect, useRef, useState } from "react";

export default function AnimatedNumber({ value, suffix = "", duration = 420, disabled = false }) {
  const previousValue = useRef(Number(value) || 0);
  const [displayValue, setDisplayValue] = useState(Number(value) || 0);

  useEffect(() => {
    const nextValue = Number(value) || 0;

    if (disabled) {
      previousValue.current = nextValue;
      setDisplayValue(nextValue);
      return undefined;
    }

    const startValue = previousValue.current;
    const difference = nextValue - startValue;
    const startTime = performance.now();
    let frameId;

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const animatedValue = Math.round(startValue + difference * eased);
      const min = Math.min(startValue, nextValue);
      const max = Math.max(startValue, nextValue);
      setDisplayValue(Math.min(max, Math.max(min, animatedValue)));

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        previousValue.current = nextValue;
      }
    }

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [disabled, duration, value]);

  return (
    <span className="animated-number" aria-label={`${value}${suffix}`}>
      {displayValue}
      {suffix}
    </span>
  );
}
