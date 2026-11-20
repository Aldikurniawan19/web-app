"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  useScroll,
  useTransform,
  useReducedMotion,
  motion,
  type MotionValue,
  type UseScrollOptions,
} from "framer-motion";
import { cn } from "@/lib/utils";

const MOBILE_BREAKPOINT_PX = 768;

export interface ContainerScrollProps {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
  footerComponent?: React.ReactNode;
  /**
   * Jika true (default), membungkus children dengan bingkai perangkat bergaya tablet Aceternity.
   * Set false bila children sudah memiliki frame perangkat sendiri (misalnya IPhoneMockup).
   */
  framed?: boolean;
  containerClassName?: string;
  innerClassName?: string;
  headerClassName?: string;
  cardClassName?: string;
  mobileScaleRange?: [number, number];
  desktopScaleRange?: [number, number];
  rotateRange?: [number, number];
  headerTranslateRange?: [number, number];
  scrollOffset?: NonNullable<UseScrollOptions["offset"]>;
  /**
   * Titik progres scroll (0..1) saat rotasi & skala selesai tegak lurus (default 1).
   */
  animationEndProgress?: number;
}

export const ContainerScroll = ({
  titleComponent,
  children,
  footerComponent,
  framed = true,
  containerClassName,
  innerClassName,
  headerClassName,
  cardClassName,
  mobileScaleRange = [0.7, 0.9],
  desktopScaleRange = [1.05, 1],
  rotateRange = [20, 0],
  headerTranslateRange = [0, -100],
  scrollOffset,
  animationEndProgress = 1,
}: ContainerScrollProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    ...(scrollOffset ? { offset: scrollOffset } : {}),
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT_PX);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scaleDimensions: [number, number] = isMobile
    ? mobileScaleRange
    : desktopScaleRange;

  const rotate = useTransform(
    scrollYProgress,
    [0, animationEndProgress],
    prefersReducedMotion ? [0, 0] : rotateRange
  );
  const scale = useTransform(
    scrollYProgress,
    [0, animationEndProgress],
    prefersReducedMotion ? [1, 1] : scaleDimensions
  );
  const translate = useTransform(
    scrollYProgress,
    [0, animationEndProgress],
    prefersReducedMotion ? [0, 0] : headerTranslateRange
  );

  return (
    <div
      className={cn(
        framed
          ? "h-[60rem] md:h-[80rem] flex items-center justify-center relative p-2 md:p-20"
          : "relative flex flex-col items-center justify-start w-full",
        containerClassName
      )}
      ref={containerRef}
    >
      <div
        className={cn(
          framed ? "py-10 md:py-40 w-full relative" : "w-full relative",
          innerClassName
        )}
        style={{
          perspective: "1000px",
        }}
      >
        <Header
          translate={translate}
          titleComponent={titleComponent}
          className={headerClassName}
        />
        <Card
          rotate={rotate}
          translate={translate}
          scale={scale}
          framed={framed}
          className={cardClassName}
        >
          {children}
        </Card>
        {footerComponent ? (
          <div className="phone-dock-enter relative z-10 flex w-full justify-center">
            {footerComponent}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export interface HeaderProps {
  translate: MotionValue<number>;
  titleComponent: string | React.ReactNode;
  className?: string;
}

export const Header = ({
  translate,
  titleComponent,
  className,
}: HeaderProps) => {
  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      className={cn("max-w-5xl mx-auto text-center", className)}
    >
      {titleComponent}
    </motion.div>
  );
};

export interface CardProps {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate?: MotionValue<number>;
  framed?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Card = ({
  rotate,
  scale,
  framed = true,
  className,
  children,
}: CardProps) => {
  if (!framed) {
    return (
      <motion.div
        style={{
          rotateX: rotate,
          scale,
        }}
        className={cn(
          "relative mx-auto flex w-full flex-col items-center will-change-transform",
          className
        )}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      className={cn(
        "max-w-5xl -mt-12 mx-auto h-[30rem] md:h-[40rem] w-full border-4 border-border-subtle p-2 md:p-6 bg-foreground rounded-[30px] shadow-2xl",
        className
      )}
    >
      <div className="h-full w-full overflow-hidden rounded-2xl bg-background-soft md:rounded-2xl md:p-4">
        {children}
      </div>
    </motion.div>
  );
};
