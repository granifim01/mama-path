/// Базовый URL бэкенда (Next.js API).
///
/// Запуск с другим адресом:
/// flutter run --dart-define=API_BASE=http://10.0.2.2:3000
class ApiConfig {
  static const baseUrl = String.fromEnvironment(
    'API_BASE',
    defaultValue: 'http://localhost:3000',
  );

  static String v1(String path) => '$baseUrl/api/v1$path';
}
