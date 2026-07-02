interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

/** Material Symbols 아이콘 (데모 .msym 동일) */
export default function Icon({ name, size = 20, className = '' }: IconProps) {
  return (
    <span className={`msym ${className}`} style={{ fontSize: `${size / 16}rem` }} aria-hidden>
      {name}
    </span>
  );
}
