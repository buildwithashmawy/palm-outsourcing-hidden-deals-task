import { useEffect, useRef } from 'react';

interface Props {
  onEnter: () => void;
  enabled: boolean;
  rootMargin?: string;
}

export function Sentinel({ onEnter, enabled, rootMargin = '320px 0px' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const cbRef = useRef(onEnter);
  cbRef.current = onEnter;

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) cbRef.current();
      },
      { rootMargin },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [enabled, rootMargin]);

  return <div ref={ref} aria-hidden style={{ height: 1 }} />;
}
