import fs from "fs";
import path from "path";

const INVISIBLE = /[\u200b-\u200d\ufeff\u00ad]/g;

function cleanText(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }
  return value.replace(INVISIBLE, "").replace(/\s+/g, " ").trim();
}

const file = path.join(process.cwd(), "..", "data", "hospitals.json");
const data = JSON.parse(fs.readFileSync(file, "utf-8"));

for (const hospital of data.hospitals ?? []) {
  hospital.name = cleanText(hospital.name);
  hospital.address = cleanText(hospital.address);
  hospital.description = cleanText(hospital.description);
  hospital.schedule = cleanText(hospital.schedule);

  const rating = hospital.rating;
  if (
    rating != null &&
    (rating <= 0 ||
      rating > 5 ||
      (Number.isInteger(rating) && rating < 4))
  ) {
    hospital.rating = null;
  }

  for (const review of hospital.reviews ?? []) {
    if (typeof review.text === "string") {
      review.text = cleanText(
        review.text
          .replace(/^Отзыв\s*\.?\s*/i, "")
          .replace(/^Пациент\s*\.?\s*/i, ""),
      ) as string;
    }
  }
}

fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
console.log("Cleaned hospitals.json display fields.");
