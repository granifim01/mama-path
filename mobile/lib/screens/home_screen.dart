import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../services/api_client.dart';
import '../theme/app_colors.dart';
import '../widgets/async_body.dart';
import '../widgets/feature_card.dart';
import '../widgets/section_header.dart';
import 'courses_screen.dart';
import 'help_screen.dart';
import 'hospitals_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _api = ApiClient();
  late Future<_HomeStats> _statsFuture;

  @override
  void initState() {
    super.initState();
    _load();
  }

  void _load() {
    _statsFuture = _fetchStats();
  }

  Future<_HomeStats> _fetchStats() async {
    final hospitals = await _api.fetchHospitals();
    final courses = await _api.fetchCourses();
    final chapters = courses.tracks.fold<int>(
      0,
      (sum, track) => sum + track.chapters.length,
    );
    return _HomeStats(
      hospitals: hospitals.count,
      chapters: chapters,
      tracks: courses.tracks.length,
    );
  }

  @override
  void dispose() {
    _api.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: RefreshIndicator(
        onRefresh: () async {
          setState(_load);
          await _statsFuture;
        },
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
          children: [
            Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: AppColors.accentSoft,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  alignment: Alignment.center,
                  child: const Text('♡', style: TextStyle(fontSize: 20)),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Mama Path',
                      style: GoogleFonts.onest(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    Text(
                      'для будущих родителей',
                      style: GoogleFonts.onest(
                        fontSize: 12,
                        color: AppColors.muted,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 24),
            const SectionHeader(
              eyebrow: 'Казахстан',
              title: 'Всё важное — от планирования до первых месяцев',
              subtitle:
                  'Курсы, роддома, подбор товаров и помощь в срочных ситуациях.',
            ),
            const SizedBox(height: 16),
            AsyncBody<_HomeStats>(
              future: _statsFuture,
              onRetry: () => setState(_load),
              builder: (context, stats) {
                return Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _StatChip('${stats.chapters} глав'),
                    _StatChip('${stats.hospitals} роддомов'),
                    _StatChip('${stats.tracks} курса'),
                  ],
                );
              },
            ),
            const SizedBox(height: 24),
            FeatureCard(
              icon: '📚',
              color: AppColors.accent,
              title: 'Курсы для мамы и папы',
              text: '27 бесплатных глав с чек-листами и тестами',
              onTap: () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const CoursesScreen()),
              ),
            ),
            const SizedBox(height: 12),
            FeatureCard(
              icon: '🏥',
              color: AppColors.blue,
              title: 'Роддома',
              text: 'Адреса, цены, отзывы — 4 города Казахстана',
              onTap: () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const HospitalsScreen()),
              ),
            ),
            const SizedBox(height: 12),
            FeatureCard(
              icon: '🆘',
              color: AppColors.red,
              title: 'Срочная помощь',
              text: 'Подскажет, когда звонить 103 или ехать в роддом',
              onTap: () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const HelpScreen()),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HomeStats {
  const _HomeStats({
    required this.hospitals,
    required this.chapters,
    required this.tracks,
  });

  final int hospitals;
  final int chapters;
  final int tracks;
}

class _StatChip extends StatelessWidget {
  const _StatChip(this.label);

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: AppColors.border),
      ),
      child: Text(
        label,
        style: GoogleFonts.onest(
          fontSize: 13,
          fontWeight: FontWeight.w600,
          color: AppColors.text,
        ),
      ),
    );
  }
}
