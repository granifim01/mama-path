import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';

import '../models/hospital.dart';
import '../theme/app_colors.dart';

String _formatPrice(int value) {
  final raw = value.toString();
  final buffer = StringBuffer();
  for (var i = 0; i < raw.length; i++) {
    if (i > 0 && (raw.length - i) % 3 == 0) buffer.write(' ');
    buffer.write(raw[i]);
  }
  return buffer.toString();
}

class HospitalDetailScreen extends StatelessWidget {
  const HospitalDetailScreen({super.key, required this.hospital});

  final Hospital hospital;

  Future<void> _call(String phone) async {
    final uri = Uri.parse('tel:$phone');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  @override
  Widget build(BuildContext context) {
    final paid = hospital.services.where((s) => s.priceFrom != null).toList();

    return Scaffold(
      appBar: AppBar(title: Text(hospital.name)),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
        children: [
          Text(
            '${hospital.cityName} · ${hospital.facilityLabel}',
            style: GoogleFonts.onest(color: AppColors.muted, fontSize: 14),
          ),
          if (hospital.address != null) ...[
            const SizedBox(height: 12),
            _InfoRow(Icons.place_outlined, hospital.address!),
          ],
          if (hospital.phone != null) ...[
            const SizedBox(height: 8),
            InkWell(
              onTap: () => _call(hospital.phone!),
              child: _InfoRow(Icons.phone_outlined, hospital.phone!),
            ),
          ],
          if (hospital.schedule != null) ...[
            const SizedBox(height: 8),
            _InfoRow(Icons.schedule_rounded, hospital.schedule!),
          ],
          if (paid.isNotEmpty) ...[
            const SizedBox(height: 20),
            Text(
              'Услуги и цены',
              style: GoogleFonts.onest(fontSize: 17, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 10),
            ...paid.map(
              (service) => Card(
                child: ListTile(
                  title: Text(service.title),
                  trailing: Text(
                    service.priceFrom != null
                        ? 'от ${_formatPrice(service.priceFrom!)} ₸'
                        : '—',
                    style: GoogleFonts.onest(fontWeight: FontWeight.w600),
                  ),
                ),
              ),
            ),
          ],
          if (hospital.reviews.isNotEmpty) ...[
            const SizedBox(height: 20),
            Text(
              'Отзывы',
              style: GoogleFonts.onest(fontSize: 17, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 10),
            ...hospital.reviews.take(5).map(
                  (review) => Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Text(
                        review.text,
                        style: GoogleFonts.onest(height: 1.5, fontSize: 14),
                      ),
                    ),
                  ),
                ),
          ],
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow(this.icon, this.text);

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 20, color: AppColors.accentDark),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            text,
            style: GoogleFonts.onest(fontSize: 15, height: 1.45),
          ),
        ),
      ],
    );
  }
}
