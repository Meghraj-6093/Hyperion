import React from "react";

type StarBorderProps<T extends React.ElementType> =
  React.ComponentPropsWithoutRef<T> & {
    as?: T;
    className?: string;
    children?: React.ReactNode;
    color?: string;
    speed?: React.CSSProperties["animationDuration"];
    thickness?: number;
    hoverOpacity?: number;
    idleOpacity?: number;
  };

export const StarBorder = <T extends React.ElementType = "button">({
  as,
  className = "",
  color = "white",
  speed = "6s",
  thickness = 1,
  hoverOpacity,
  idleOpacity,
  children,
  ...rest
}: StarBorderProps<T>) => {
  const Component = as || "button";
  const [hovered, setHovered] = React.useState(false);

  const currentOpacity = hovered
    ? (hoverOpacity ?? 0.7)
    : (idleOpacity ?? 0.7);

  return (
    <Component
      className={`relative inline-block overflow-hidden rounded-[20px] ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...(rest as any)}
      style={{
        padding: `${thickness}px 0`,
        ...(rest as any).style,
      }}
    >
      <div
        className="absolute z-0 h-[50%] w-[300%] animate-star-movement-bottom right-[-250%] bottom-[-11px] rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
          opacity: currentOpacity,
        }}
      />
      <div
        className="absolute z-0 h-[50%] w-[300%] animate-star-movement-top left-[-250%] top-[-10px] rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
          opacity: currentOpacity,
        }}
      />
      <div className="relative z-1 rounded-[20px] border border-gray-800 bg-gradient-to-b from-black to-gray-900 px-[26px] py-[16px] text-center text-[16px] text-white">
        {children}
      </div>
    </Component>
  );
};

export default StarBorder;
