type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan";

  const styles = {
    primary:
      "bg-cyan text-[#062628] hover:bg-[#7eecf0]",
    secondary:
      "border border-line bg-transparent text-ink hover:border-cyan/40 hover:bg-white/5",
    ghost:
      "text-muted hover:text-ink",
  } as const;

  return (
    <a href={href} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </a>
  );
}
