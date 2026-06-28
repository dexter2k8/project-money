"use client";
import { useEffect, useRef, useState } from "react";
import { segmentedControlItemVariants, INDICATOR } from "./constants";

interface ISegmentedControlItem {
  key: number;
  label: React.ReactNode;
}

interface ISegmentedControlProps {
  items: ISegmentedControlItem[];
  defaultSelected?: number;
  selected?: number;
  onSelect?: (key: number) => void;
}

export default function SegmentedControl({
  items,
  defaultSelected = 0,
  selected,
  onSelect,
}: ISegmentedControlProps) {
  const [internalActive, setInternalActive] = useState<number>(defaultSelected);
  const active = selected ?? internalActive;
  const containerRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const activeItem = container?.querySelector(".segmented-control-item--active");
    if (!container || !activeItem) return;

    const { offsetLeft, offsetWidth } = activeItem as HTMLElement;
    container.style.setProperty("--indicator-left", `${offsetLeft}px`);
    container.style.setProperty("--indicator-width", `${offsetWidth}px`);
  }, [active]);

  return (
    <ul className="w-fit relative p-1 rounded-lg shadow-sm" ref={containerRef}>
      <div className={INDICATOR} />
      {items.map((item) => (
        <li
          key={item.key}
          className={segmentedControlItemVariants({ active: active === item.key })}
          onClick={() => {
            setInternalActive(item.key);
            onSelect?.(item.key);
          }}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
}
