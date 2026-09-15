class Hospital {
  Hospital({
    required this.id,
    required this.citySlug,
    required this.cityName,
    required this.name,
    required this.facilityType,
    this.address,
    this.phone,
    this.rating,
    this.schedule,
    this.hasPaidBirth,
    this.freeBirthAvailable,
    this.services = const [],
    this.reviews = const [],
    this.lat,
    this.lng,
  });

  final String id;
  final String citySlug;
  final String cityName;
  final String name;
  final String facilityType;
  final String? address;
  final String? phone;
  final double? rating;
  final String? schedule;
  final bool? hasPaidBirth;
  final bool? freeBirthAvailable;
  final List<HospitalService> services;
  final List<HospitalReview> reviews;
  final double? lat;
  final double? lng;

  factory Hospital.fromJson(Map<String, dynamic> json) {
    return Hospital(
      id: json['id'] as String,
      citySlug: json['city_slug'] as String,
      cityName: json['city_name'] as String,
      name: json['name'] as String,
      facilityType: json['facility_type'] as String? ?? 'unknown',
      address: json['address'] as String?,
      phone: json['phone'] as String?,
      rating: (json['rating'] as num?)?.toDouble(),
      schedule: json['schedule'] as String?,
      hasPaidBirth: json['has_paid_birth'] as bool?,
      freeBirthAvailable: json['free_birth_available'] as bool?,
      services: (json['services'] as List<dynamic>? ?? [])
          .map((e) => HospitalService.fromJson(e as Map<String, dynamic>))
          .toList(),
      reviews: (json['reviews'] as List<dynamic>? ?? [])
          .map((e) => HospitalReview.fromJson(e as Map<String, dynamic>))
          .toList(),
      lat: (json['lat'] as num?)?.toDouble(),
      lng: (json['lng'] as num?)?.toDouble(),
    );
  }

  String get facilityLabel {
    switch (facilityType) {
      case 'public':
        return 'Государственный';
      case 'private':
        return 'Частный';
      default:
        return 'Медучреждение';
    }
  }
}

class HospitalService {
  HospitalService({required this.title, this.priceFrom});

  final String title;
  final int? priceFrom;

  factory HospitalService.fromJson(Map<String, dynamic> json) {
    return HospitalService(
      title: json['title'] as String,
      priceFrom: json['price_from'] as int?,
    );
  }
}

class HospitalReview {
  HospitalReview({required this.text, this.author});

  final String text;
  final String? author;

  factory HospitalReview.fromJson(Map<String, dynamic> json) {
    return HospitalReview(
      text: json['text'] as String? ?? '',
      author: json['author'] as String?,
    );
  }
}

class HospitalsResponse {
  HospitalsResponse({required this.count, required this.hospitals});

  final int count;
  final List<Hospital> hospitals;

  factory HospitalsResponse.fromJson(Map<String, dynamic> json) {
    return HospitalsResponse(
      count: json['count'] as int? ?? 0,
      hospitals: (json['hospitals'] as List<dynamic>? ?? [])
          .map((e) => Hospital.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}
