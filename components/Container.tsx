type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section";
};

export function Container({
  children,
  className = "",
  as: Tag = "div",
}: ContainerProps) {
  return (
    <Tag className={`mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10 ${className}`}>
      {children}
    </Tag>
  );
}
