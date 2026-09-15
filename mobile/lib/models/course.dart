class CourseTrack {
  CourseTrack({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.color,
    required this.chapters,
  });

  final String id;
  final String title;
  final String subtitle;
  final String color;
  final List<Chapter> chapters;

  factory CourseTrack.fromJson(Map<String, dynamic> json) {
    return CourseTrack(
      id: json['id'] as String,
      title: json['title'] as String,
      subtitle: json['subtitle'] as String? ?? '',
      color: json['color'] as String? ?? '#d4567f',
      chapters: (json['chapters'] as List<dynamic>? ?? [])
          .map((e) => Chapter.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}

class Chapter {
  Chapter({
    required this.id,
    required this.order,
    required this.title,
    required this.phaseLabel,
    required this.durationMin,
    required this.summary,
    required this.sections,
    this.isPremium = false,
  });

  final String id;
  final int order;
  final String title;
  final String phaseLabel;
  final int durationMin;
  final String summary;
  final List<ChapterSection> sections;
  final bool isPremium;

  factory Chapter.fromJson(Map<String, dynamic> json) {
    return Chapter(
      id: json['id'] as String,
      order: json['order'] as int? ?? 0,
      title: json['title'] as String,
      phaseLabel: json['phase_label'] as String? ?? '',
      durationMin: json['duration_min'] as int? ?? 5,
      summary: json['summary'] as String? ?? '',
      isPremium: json['is_premium'] as bool? ?? false,
      sections: (json['sections'] as List<dynamic>? ?? [])
          .map((e) => ChapterSection.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}

class ChapterSection {
  ChapterSection({required this.heading, required this.body});

  final String heading;
  final String body;

  factory ChapterSection.fromJson(Map<String, dynamic> json) {
    return ChapterSection(
      heading: json['heading'] as String? ?? '',
      body: json['body'] as String? ?? '',
    );
  }
}

class CoursesResponse {
  CoursesResponse({required this.tracks});

  final List<CourseTrack> tracks;

  factory CoursesResponse.fromJson(Map<String, dynamic> json) {
    return CoursesResponse(
      tracks: (json['tracks'] as List<dynamic>? ?? [])
          .map((e) => CourseTrack.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}
