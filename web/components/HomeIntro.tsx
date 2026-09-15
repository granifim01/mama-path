"use client";

import { PageIntro } from "@/components/PageIntro";
import { useLocale } from "@/components/LocaleProvider";

type Props = {
  chaptersTotal: number;
  hospitalsCount: number;
  productsTotal: number;
};

export function HomeIntro({ chaptersTotal, hospitalsCount, productsTotal }: Props) {
  const { ui, format } = useLocale();

  return (
    <PageIntro
      size="home"
      eyebrow={ui.home.eyebrow}
      title={ui.home.title}
      description={ui.home.description}
    >
      <div className="stats">
        <span className="stat">
          {format(ui.home.statsChapters, { n: chaptersTotal })}
        </span>
        <span className="stat">
          {format(ui.home.statsHospitals, { n: hospitalsCount })}
        </span>
        <span className="stat">
          {format(ui.home.statsProducts, { n: productsTotal })}
        </span>
      </div>
    </PageIntro>
  );
}
