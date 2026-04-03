type StatusPillProps = {
  status: string;
};

function getStatusLabel(status: string) {
  switch (status) {
    case "ready":
      return "Бэлэн";
    case "succeeded":
      return "Амжилттай";
    case "completed":
      return "Дууссан";
    case "rendering":
      return "Үүсгэж байна";
    case "processing":
      return "Боловсруулж байна";
    case "queued":
      return "Дараалалд";
    case "planning":
      return "Төлөвлөж байна";
    case "editable":
      return "Засварлах";
    case "draft":
      return "Ноорог";
    case "retrying":
      return "Дахин оролдож байна";
    case "failed":
      return "Алдаа";
    default:
      return status;
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case "ready":
    case "succeeded":
    case "completed":
      return "status-pill status-ready";
    case "rendering":
    case "processing":
    case "queued":
    case "planning":
      return "status-pill status-rendering";
    case "editable":
    case "draft":
    case "retrying":
      return "status-pill status-editable";
    case "failed":
      return "status-pill status-failed";
    default:
      return "status-pill";
  }
}

export function StatusPill({ status }: StatusPillProps) {
  return <span className={getStatusClass(status)}>{getStatusLabel(status)}</span>;
}
