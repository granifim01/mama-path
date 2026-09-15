export function formatPrice(value?: number | null): string {
  if (!value) {
    return "—";
  }
  return `${value.toLocaleString("ru-RU")} ₸`;
}

export function facilityLabel(type: string): string {
  switch (type) {
    case "public":
      return "Государственный";
    case "private":
      return "Частный";
    default:
      return "Медучреждение";
  }
}

/** YDoc иногда кладёт число отзывов в поле рейтинга — показываем только правдоподобные оценки */
export function formatHospitalRating(rating?: number | null): string | null {
  if (rating == null || rating <= 0 || rating > 5) {
    return null;
  }
  if (Number.isInteger(rating) && rating < 4) {
    return null;
  }
  const formatted = Number.isInteger(rating)
    ? String(rating)
    : rating.toFixed(1).replace(/\.0$/, "");
  return `★ ${formatted}`;
}

const INVISIBLE_CHARS = /[\u200b-\u200d\ufeff\u00ad]/g;

export function sanitizeDisplayText(text: string): string {
  return text.replace(INVISIBLE_CHARS, "").replace(/\s+/g, " ").trim();
}

export function cleanReviewText(text: string): string {
  return sanitizeDisplayText(text)
    .replace(/^Отзыв\s*\.?\s*/i, "")
    .replace(/^Пациент\s*\.?\s*/i, "");
}

export function sourceLabel(source: string): string {
  switch (source) {
    case "ydoc":
      return "YDoc";
    case "103.kz":
      return "103.kz";
    default:
      return source;
  }
}
