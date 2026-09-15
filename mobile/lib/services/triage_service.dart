enum TriageLevel { emergency, urgent, doctor, observe }

class TriageResult {
  const TriageResult({
    required this.level,
    required this.title,
    required this.advice,
    required this.action,
  });

  final TriageLevel level;
  final String title;
  final String advice;
  final String action;

  String get levelLabel {
    switch (level) {
      case TriageLevel.emergency:
        return 'Немедленно — звоните 103';
      case TriageLevel.urgent:
        return 'Срочно — нужна помощь сейчас';
      case TriageLevel.doctor:
        return 'Запишитесь к врачу';
      case TriageLevel.observe:
        return 'Не срочно — можно уточнить позже';
    }
  }
}

class _Rule {
  const _Rule({
    required this.keywords,
    required this.level,
    required this.title,
    required this.advice,
    required this.action,
  });

  final List<String> keywords;
  final TriageLevel level;
  final String title;
  final String advice;
  final String action;
}

const _rules = <_Rule>[
  _Rule(
    keywords: ['не дышит', 'задохнул', 'синюшн', 'синий', 'без сознания', 'судорог'],
    level: TriageLevel.emergency,
    title: 'Экстренная ситуация',
    advice: 'Возможна угроза жизни. Не ждите ответа в приложении.',
    action: 'Немедленно звоните 103 или скорую помощь.',
  ),
  _Rule(
    keywords: ['кровотечен', 'кровь обильн', 'воды отошл', 'схватк', 'роды начал'],
    level: TriageLevel.urgent,
    title: 'Срочно — возможны роды или осложнение',
    advice: 'При кровотечении, отхождении вод или регулярных схватках нужна помощь.',
    action: 'Звоните 103 или езжайте в роддом / к врачу сейчас.',
  ),
  _Rule(
    keywords: ['температур', '38', '39', '40', 'жар'],
    level: TriageLevel.urgent,
    title: 'Высокая температура',
    advice: 'Температура 38°C+ у беременной или новорождённого требует оценки врача.',
    action: 'Свяжитесь с врачом или вызовите скорую, если ребёнку меньше 1 месяца.',
  ),
  _Rule(
    keywords: ['не шевел', 'не двига', 'тупн', 'вял'],
    level: TriageLevel.urgent,
    title: 'Снижение шевелений плода',
    advice: 'Резкое уменьшение шевелений — повод для срочной оценки.',
    action: 'Позвоните в женскую консультацию или поезжайте в приёмное отделение.',
  ),
  _Rule(
    keywords: ['тошнот', 'рвот', 'изжог', 'насморк', 'простуд'],
    level: TriageLevel.doctor,
    title: 'Симптомы для консультации врача',
    advice: 'Симптом не выглядит экстренным, но требует медицинской оценки.',
    action: 'Запишитесь к врачу в ближайшие 24–48 часов.',
  ),
  _Rule(
    keywords: ['питани', 'диет', 'витамин', 'фолиев', 'что можно есть'],
    level: TriageLevel.observe,
    title: 'Общий вопрос по уходу',
    advice: 'Это образовательный вопрос. Используйте курсы и проверенные источники.',
    action: 'При сомнениях уточните у вашего врача.',
  ),
];

TriageResult triageQuery(String input) {
  final text = input.toLowerCase().trim();

  for (final rule in _rules) {
    if (rule.keywords.any(text.contains)) {
      return TriageResult(
        level: rule.level,
        title: rule.title,
        advice: rule.advice,
        action: rule.action,
      );
    }
  }

  return const TriageResult(
    level: TriageLevel.doctor,
    title: 'Нужна консультация врача',
    advice:
        'По описанию сложно оценить срочность дистанционно. Лучше не откладывать визит.',
    action: 'Опишите симптомы врачу или обратитесь в поликлинику / роддом.',
  );
}
