import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/api_config.dart';
import '../models/course.dart';
import '../models/hospital.dart';

class ApiException implements Exception {
  ApiException(this.message, {this.statusCode});

  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}

class ApiClient {
  ApiClient({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;

  Future<HospitalsResponse> fetchHospitals({
    String? city,
    String? query,
    bool paidOnly = false,
    bool freeOnly = false,
  }) async {
    final params = <String, String>{};
    if (city != null && city.isNotEmpty) params['city'] = city;
    if (query != null && query.isNotEmpty) params['q'] = query;
    if (paidOnly) params['paid'] = '1';
    if (freeOnly) params['free'] = '1';

    final uri = Uri.parse(ApiConfig.v1('/hospitals')).replace(
      queryParameters: params.isEmpty ? null : params,
    );

    final response = await _client.get(uri);
    _ensureOk(response);
    return HospitalsResponse.fromJson(
      jsonDecode(response.body) as Map<String, dynamic>,
    );
  }

  Future<Hospital> fetchHospital(String id) async {
    final uri = Uri.parse(ApiConfig.v1('/hospitals/${Uri.encodeComponent(id)}'));
    final response = await _client.get(uri);
    _ensureOk(response);
    return Hospital.fromJson(
      jsonDecode(response.body) as Map<String, dynamic>,
    );
  }

  Future<CoursesResponse> fetchCourses() async {
    final uri = Uri.parse(ApiConfig.v1('/courses'));
    final response = await _client.get(uri);
    _ensureOk(response);
    return CoursesResponse.fromJson(
      jsonDecode(response.body) as Map<String, dynamic>,
    );
  }

  void _ensureOk(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) return;
    throw ApiException(
      'Ошибка сервера (${response.statusCode})',
      statusCode: response.statusCode,
    );
  }

  void dispose() => _client.close();
}
