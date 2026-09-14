type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  id?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  id,
}: SectionHeadingProps) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-cyan">
        {eyebrow}
      </p>
      <h2
        id={id}
        className="font-display mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-muted sm:text-[17px]">
          {description}
        </p>
      ) : null}
    </div>
  );
}
