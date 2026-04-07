type AssetPreviewProps = {
  title: string;
  url: string | null;
  kind: "image" | "video";
  emptyText: string;
};

export function AssetPreview({
  title,
  url,
  kind,
  emptyText,
}: AssetPreviewProps) {
  return (
    <article className="asset-preview-card">
      <div className="action-row" style={{ justifyContent: "space-between" }}>
        <strong>{title}</strong>
        <span className="badge">{url ? "Байгаа" : "Хоосон"}</span>
      </div>
      {url ? (
        kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="asset-preview-media" src={url} alt={title} />
        ) : (
          <video className="asset-preview-media" src={url} controls />
        )
      ) : (
        <p className="muted-text">{emptyText}</p>
      )}
    </article>
  );
}
