import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../models/course.dart';
import '../services/api_client.dart';
import '../theme/app_colors.dart';
import '../widgets/async_body.dart';
import '../widgets/section_header.dart';
import 'chapter_screen.dart';

class CoursesScreen extends StatefulWidget {
  const CoursesScreen({super.key});

  @override
  State<CoursesScreen> createState() => _CoursesScreenState();
}

class _CoursesScreenState extends State<CoursesScreen> {
  final _api = ApiClient();
  late Future<List<CourseTrack>> _future;

  @override
  void initState() {
    super.initState();
    _load();
  }

  void _load() {
    _future = _api.fetchCourses().then((r) => r.tracks);
  }

  @override
  void dispose() {
    _api.dispose();
    super.dispose();
  }

  Color _parseColor(String hex) {
    final value = hex.replaceAll('#', '');
    return Color(int.parse('FF$value', radix: 16));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Курсы')),
      body: AsyncBody<List<CourseTrack>>(
        future: _future,
        onRetry: () => setState(_load),
        builder: (context, tracks) {
          return ListView(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
            children: [
              const SectionHeader(
                title: 'Курсы для родителей',
                subtitle: 'Все главы бесплатные — читайте в своём темпе.',
              ),
              const SizedBox(height: 20),
              ...tracks.map((track) {
                final color = _parseColor(track.color);
                return Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(18),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 10,
                                height: 44,
                                decoration: BoxDecoration(
                                  color: color,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      track.title,
                                      style: GoogleFonts.onest(
                                        fontSize: 18,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                    Text(
                                      track.subtitle,
                                      style: GoogleFonts.onest(
                                        fontSize: 13,
                                        color: AppColors.muted,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 14),
                          ...track.chapters.map((chapter) {
                            return ListTile(
                              contentPadding: EdgeInsets.zero,
                              title: Text(
                                '${chapter.order}. ${chapter.title}',
                                style: GoogleFonts.onest(fontWeight: FontWeight.w600),
                              ),
                              subtitle: Text(
                                '${chapter.phaseLabel} · ${chapter.durationMin} мин',
                                style: GoogleFonts.onest(
                                  fontSize: 12,
                                  color: AppColors.muted,
                                ),
                              ),
                              trailing: const Icon(Icons.chevron_right_rounded),
                              onTap: () => Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (_) => ChapterScreen(
                                    trackTitle: track.title,
                                    chapter: chapter,
                                    accent: color,
                                  ),
                                ),
                              ),
                            );
                          }),
                        ],
                      ),
                    ),
                  ),
                );
              }),
            ],
          );
        },
      ),
    );
  }
}
