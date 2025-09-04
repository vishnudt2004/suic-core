"use client";

import { useCallback, useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaOptionsType, EmblaPluginType } from "embla-carousel";
import {
  FaChevronUp,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa6";
import { cn } from "../utils/cn";

type Slide = {
  content: ReactNode;
  visual: ReactNode;
  decor?: ReactNode;
  decorPosition?: string;
  accentColor?: string;
};

type Config = {
  width?: string;
  height?: string;
  surfaceColor?: string;
  textColor?: string;
  controlsColor?: string;
  accentColor?: string;
  slidesDecor?: ReactNode;
  slidesDecorPosition?: string;
  containerStyle?: CSSProperties;
  containerClassName?: string;
  emblaOptions?: EmblaOptionsType;
  emblaPlugins?: EmblaPluginType[];
};

type CarouselProps = {
  slides: Slide[];
  variant?: "landscape" | "portrait";
  config?: Config;
  onInit?: (api: ReturnType<typeof useEmblaCarousel>[1]) => void;
};

export default function Carousel({
  slides,
  variant = "landscape",
  config = {},
  onInit,
}: CarouselProps) {
  const isPortrait = variant === "portrait";

  const defaultConfig: Required<CarouselProps["config"]> = {
    width: isPortrait ? "300px" : "750px",
    height: isPortrait ? "550px" : "350px",
    surfaceColor: "var(--color-gray-100)",
    textColor: "var(--color-gray-800)",
    controlsColor: "var(--color-neutral-400)",
    accentColor: "var(--color-gray-500)",
    slidesDecor: (
      <div className="size-30 [&>*]:flex [&>*]:rounded-full [&>*]:bg-(--accent-color)">
        <span className="size-6 translate-x-20 translate-y-5"></span>
        <span className="size-10 translate-x-5"></span>
        <span className="size-15 translate-x-14"></span>
        <span className="size-5 translate-x-1/2 -translate-y-8"></span>
      </div>
    ),
    slidesDecorPosition: isPortrait ? "right-0 top-0" : "left-0 bottom-0",
    containerStyle: {}, // e.g. border, border-radius, etc.
    containerClassName: "",
    emblaOptions: { axis: "y", watchDrag: true },
    emblaPlugins: [],
  };

  const finalConfig = {
    ...defaultConfig,
    ...config,
    emblaOptions: {
      ...defaultConfig.emblaOptions,
      ...config.emblaOptions,
    },
  };

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      ...finalConfig?.emblaOptions,
    },
    finalConfig?.emblaPlugins,
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number): void => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    onSelect(); // initial

    if (onInit) onInit(emblaApi);
  }, [emblaApi, onSelect, onInit]);

  const extractedAccentColors = slides.map(
    (slide) => slide.accentColor || finalConfig.accentColor,
  );

  const isAxisX = finalConfig.emblaOptions?.axis === "x";
  const prevIcon = isAxisX ? <FaChevronLeft /> : <FaChevronUp />;
  const nextIcon = isAxisX ? <FaChevronRight /> : <FaChevronDown />;

  return (
    <div
      className={cn(
        "relative w-(--w) min-w-(--w) overflow-hidden select-none",
        finalConfig.containerClassName,
      )}
      style={{
        "--w": finalConfig.width,
        "--h": finalConfig.height,
        "--surface-color": finalConfig.surfaceColor,
        "--text-color": finalConfig.textColor,
        "--controls-color": finalConfig.controlsColor,
        "--accent-color":
          extractedAccentColors[selectedIndex] || finalConfig.accentColor,
        ...finalConfig?.containerStyle,
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Carousel component"
    >
      <div
        ref={emblaRef}
        className={cn(
          "embla__viewport bg-(--surface-color) text-(--text-color) [&_*]:transition-colors [&_*]:duration-300",
          finalConfig.emblaOptions?.watchDrag &&
            "cursor-grab active:cursor-grabbing",
        )}
      >
        <div
          className={cn(
            "embla__container flex h-(--h) w-(--w)",
            !isAxisX && "flex-col",
          )}
        >
          {slides.map(
            (
              {
                content,
                visual,
                decor = finalConfig.slidesDecor,
                decorPosition = finalConfig.slidesDecorPosition,
                accentColor = finalConfig.accentColor,
              },
              i,
            ) => {
              return (
                <div
                  key={i}
                  className={cn(
                    "embla__slide relative flex flex-[0_0_100%]",
                    isPortrait
                      ? "flex-col [&>_:first-child]:h-[45%] [&>_:nth-child(2)]:h-[55%]"
                      : "[&>*]:w-1/2",
                  )}
                  aria-label={`Slide ${i + 1} of ${slides.length}`}
                >
                  <div>{content}</div>
                  <div
                    className={cn(
                      "bg-(--accent-color) [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_img]:object-center",
                      isPortrait
                        ? "[clip-path:ellipse(95%_100%_at_50%_100%)]"
                        : "[clip-path:ellipse(65%_100%_at_65.5%_50%)]",
                    )}
                  >
                    {visual}
                  </div>

                  {decor && (
                    <div
                      className={cn("absolute -z-1 size-auto", decorPosition)}
                      style={{ "--accent-color": accentColor }}
                    >
                      {decor}
                    </div>
                  )}
                </div>
              );
            },
          )}
        </div>
      </div>

      <div
        className={cn(
          "absolute flex items-center gap-4",
          isPortrait
            ? "bottom-3 left-1/2 -translate-x-1/2"
            : "top-1/2 right-5 -translate-y-1/2 flex-col",
        )}
      >
        <button
          className="cursor-pointer rounded-full bg-(--surface-color) p-1 text-(--controls-color) outline-2 outline-offset-3 outline-(--surface-color) transition-opacity hover:opacity-100 pointer-fine:opacity-70"
          onClick={scrollPrev}
          aria-label="Previous slide"
        >
          {prevIcon}
        </button>

        <div
          className={cn(
            "flex justify-center gap-2 rounded-full bg-(--surface-color) outline-2 outline-offset-3 outline-(--surface-color)",
            isPortrait ? "px-3 py-2" : "flex-col px-2 py-3",
          )}
        >
          {scrollSnaps.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={cn(
                "size-3 rounded-full transition-colors",
                i === selectedIndex
                  ? "bg-(--accent-color)"
                  : "cursor-pointer bg-(--controls-color) transition-opacity hover:opacity-100 pointer-fine:opacity-70",
              )}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === selectedIndex}
            />
          ))}
        </div>

        <button
          className="cursor-pointer rounded-full bg-(--surface-color) p-1 text-(--controls-color) outline-2 outline-offset-3 outline-(--surface-color) transition-opacity hover:opacity-100 pointer-fine:opacity-70"
          onClick={scrollNext}
          aria-label="Next slide"
        >
          {nextIcon}
        </button>
      </div>
    </div>
  );
}

export type { Slide, Config, CarouselProps };
