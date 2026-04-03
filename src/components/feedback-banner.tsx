type FeedbackBannerProps = {
  tone: "success" | "error";
  message: string;
};

export function FeedbackBanner({ tone, message }: FeedbackBannerProps) {
  return (
    <div
      className="section-card"
      style={{
        borderColor:
          tone === "error"
            ? "rgba(194, 85, 85, 0.24)"
            : "rgba(21, 143, 98, 0.2)",
        background:
          tone === "error"
            ? "rgba(255, 240, 240, 0.92)"
            : "rgba(240, 255, 248, 0.92)",
      }}
    >
      <p className="section-copy" style={{ color: "var(--foreground)" }}>
        {message}
      </p>
    </div>
  );
}
