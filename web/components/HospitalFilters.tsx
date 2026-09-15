"use client";

type Props = {
  cities: string[];
  cityNames: Record<string, string>;
  currentCity?: string;
  currentQuery?: string;
  paidOnly?: boolean;
  freeOnly?: boolean;
};

export function HospitalFilters({
  cities,
  cityNames,
  currentCity,
  currentQuery,
  paidOnly,
  freeOnly,
}: Props) {
  return (
    <form className="filters" method="get">
      <h2>Фильтры</h2>

      <label>
        Город
        <select name="city" defaultValue={currentCity ?? ""}>
          <option value="">Все города</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {cityNames[city] ?? city}
            </option>
          ))}
        </select>
      </label>

      <label>
        Поиск по названию или адресу
        <input
          name="q"
          type="search"
          placeholder="Например: Алматы, Кабанбай"
          defaultValue={currentQuery ?? ""}
        />
      </label>

      <label className="checkbox">
        <input
          type="checkbox"
          name="paid"
          value="1"
          defaultChecked={paidOnly}
        />
        Только с платными родами
      </label>

      <label className="checkbox">
        <input
          type="checkbox"
          name="free"
          value="1"
          defaultChecked={freeOnly}
        />
        Есть бесплатные роды
      </label>

      <button type="submit" className="btn-primary">
        Показать
      </button>
    </form>
  );
}
