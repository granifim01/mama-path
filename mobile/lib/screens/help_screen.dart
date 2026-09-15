import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';

import '../services/triage_service.dart';
import '../theme/app_colors.dart';
import '../widgets/section_header.dart';

class HelpScreen extends StatefulWidget {
  const HelpScreen({super.key});

  @override
  State<HelpScreen> createState() => _HelpScreenState();
}

class _HelpScreenState extends State<HelpScreen> {
  final _controller = TextEditingController();
  TriageResult? _result;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _analyze() {
    final text = _controller.text.trim();
    if (text.isEmpty) return;
    setState(() => _result = triageQuery(text));
  }

  Future<void> _call103() async {
    final uri = Uri.parse('tel:103');
    if (await canLaunchUrl(uri)) await launchUrl(uri);
  }

  Color _levelColor(TriageLevel level) {
    switch (level) {
      case TriageLevel.emergency:
      case TriageLevel.urgent:
        return AppColors.redSoft;
      case TriageLevel.doctor:
        return AppColors.blueSoft;
      case TriageLevel.observe:
        return AppColors.greenSoft;
    }
  }

  Color _levelAccent(TriageLevel level) {
    switch (level) {
      case TriageLevel.emergency:
      case TriageLevel.urgent:
        return AppColors.red;
      case TriageLevel.doctor:
        return AppColors.blue;
      case TriageLevel.observe:
        return AppColors.green;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Срочная помощь')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
        children: [
          const SectionHeader(
            title: 'Что делать сейчас?',
            subtitle:
                'Опишите симптомы простыми словами. Это не диагноз — только ориентир.',
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _controller,
            minLines: 4,
            maxLines: 6,
            decoration: const InputDecoration(
              labelText: 'Ваши симптомы',
              hintText: 'Например: начались схватки каждые 5 минут',
              alignLabelWithHint: true,
            ),
          ),
          const SizedBox(height: 12),
          FilledButton(
            onPressed: _analyze,
            child: const Text('Получить рекомендацию'),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: _call103,
            icon: const Icon(Icons.phone_rounded),
            label: const Text('Позвонить 103'),
          ),
          if (_result != null) ...[
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: _levelColor(_result!.level),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: _levelAccent(_result!.level).withValues(alpha: 0.25)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _result!.levelLabel,
                    style: GoogleFonts.onest(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: _levelAccent(_result!.level),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _result!.title,
                    style: GoogleFonts.onest(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _result!.advice,
                    style: GoogleFonts.onest(height: 1.5),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _result!.action,
                    style: GoogleFonts.onest(
                      fontWeight: FontWeight.w600,
                      height: 1.5,
                      color: _levelAccent(_result!.level),
                    ),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 20),
          Text(
            'Информация не заменяет врача. При угрозе жизни всегда звоните 103.',
            style: GoogleFonts.onest(fontSize: 13, color: AppColors.muted, height: 1.5),
          ),
        ],
      ),
    );
  }
}
