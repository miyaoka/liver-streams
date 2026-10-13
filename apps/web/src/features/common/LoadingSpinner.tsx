/**
 * ローディングスピナー。サイズ（sm/md/lg）とメッセージを指定可能。
 */

type Props = {
  size?: "sm" | "md" | "lg";
  message?: string;
};

export default function LoadingSpinner({ size, message }: Props) {
  const iconClassName = [
    "i-mdi-loading animate-spin",
    size === "sm" && "size-8",
    (size === "md" || !size) && "size-12",
    size === "lg" && "size-16",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <i className={iconClassName} />
      {message && <p className="text-sm font-medium">{message}</p>}
    </div>
  );
}
