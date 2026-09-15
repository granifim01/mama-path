import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../models/course.dart';
import '../theme/app_colors.dart';

class ChapterScreen extends StatelessWidget {
  const ChapterScreen({
    super.key,
    required this.trackTitle,
    required this.chapter,
    required this.accent,
  });

  final String trackTitle;
  final Chapter chapter;
  final Color accent;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(chapter.title)),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: accent.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  trackTitle,
                  style: GoogleFonts.onest(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: accent,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  chapter.summary,
                  style: GoogleFonts.onest(fontSize: 15, height: 1.5),
                ),
                const SizedBox(height: 8),
                Text(
                  '${chapter.phaseLabel} · ${chapter.durationMin} мин чтения',
                  style: GoogleFonts.onest(fontSize: 13, color: AppColors.muted),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          ...chapter.sections.map((section) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 14),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(18),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        section.heading,
                        style: GoogleFonts.onest(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        section.body,
                        style: GoogleFonts.onest(
                          fontSize: 15,
                          height: 1.55,
                          color: AppColors.text,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          }),
        ],
      ),
    );
  }
}
