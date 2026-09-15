import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../theme/app_colors.dart';

class SectionHeader extends StatelessWidget {
  const SectionHeader({
    super.key,
    required this.title,
    this.subtitle,
    this.eyebrow,
  });

  final String? eyebrow;
  final String title;
  final String? subtitle;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (eyebrow != null) ...[
          Text(
            eyebrow!.toUpperCase(),
            style: GoogleFonts.onest(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.6,
              color: AppColors.accentDark,
            ),
          ),
          const SizedBox(height: 8),
        ],
        Text(
          title,
          style: GoogleFonts.onest(
            fontSize: 28,
            fontWeight: FontWeight.w700,
            height: 1.15,
            color: AppColors.text,
          ),
        ),
        if (subtitle != null) ...[
          const SizedBox(height: 8),
          Text(
            subtitle!,
            style: GoogleFonts.onest(
              fontSize: 15,
              height: 1.5,
              color: AppColors.muted,
            ),
          ),
        ],
      ],
    );
  }
}
