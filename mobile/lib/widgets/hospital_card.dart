import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../models/hospital.dart';
import '../theme/app_colors.dart';

class HospitalCard extends StatelessWidget {
  const HospitalCard({super.key, required this.hospital, required this.onTap});

  final Hospital hospital;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final review = hospital.reviews.isNotEmpty ? hospital.reviews.first.text : null;

    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          hospital.name,
                          style: GoogleFonts.onest(
                            fontSize: 17,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${hospital.cityName} · ${hospital.facilityLabel}',
                          style: GoogleFonts.onest(
                            fontSize: 13,
                            color: AppColors.muted,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (_ratingLabel(hospital.rating) != null)
                    Chip(label: Text(_ratingLabel(hospital.rating)!)),
                ],
              ),
              if (hospital.address != null) ...[
                const SizedBox(height: 10),
                Text(
                  hospital.address!,
                  style: GoogleFonts.onest(fontSize: 14, color: AppColors.text),
                ),
              ],
              if (hospital.schedule != null) ...[
                const SizedBox(height: 6),
                Text(
                  hospital.schedule!,
                  style: GoogleFonts.onest(fontSize: 13, color: AppColors.muted),
                ),
              ],
              if (review != null && review.length > 10) ...[
                const SizedBox(height: 12),
                Text(
                  '«$review»',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.onest(
                    fontSize: 13,
                    height: 1.45,
                    color: AppColors.muted,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  String? _ratingLabel(double? rating) {
    if (rating == null || rating <= 0 || rating > 5) return null;
    if (rating == rating.roundToDouble() && rating < 4) return null;
    return '★ ${rating.toStringAsFixed(rating == rating.roundToDouble() ? 0 : 1)}';
  }
}
