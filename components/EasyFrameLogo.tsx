type EasyFrameMarkProps = {
  className?: string;
  size?: number;
};

export function EasyFrameMark({ className, size = 24 }: EasyFrameMarkProps) {
  return (
    <img
      className={className}
      src="/brand/easyframe-mark.svg"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      style={{ display: "block", width: size, height: size }}
      draggable={false}
    />
  );
}
