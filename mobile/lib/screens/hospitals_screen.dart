import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../models/hospital.dart';
import '../services/api_client.dart';
import '../theme/app_colors.dart';
import '../widgets/async_body.dart';
import '../widgets/hospital_card.dart';
import '../widgets/section_header.dart';
import 'hospital_detail_screen.dart';

class HospitalsScreen extends StatefulWidget {
  const HospitalsScreen({super.key});

  @override
  State<HospitalsScreen> createState() => _HospitalsScreenState();
}

class _HospitalsScreenState extends State<HospitalsScreen> {
  final _api = ApiClient();
  final _searchController = TextEditingController();

  String? _city;
  String _query = '';
  late Future<HospitalsResponse> _future;

  @override
  void initState() {
    super.initState();
    _load();
  }

  void _load() {
    _future = _api.fetchHospitals(city: _city, query: _query);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _api.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Роддома')),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
            child: const SectionHeader(
              title: 'Роддома Казахстана',
              subtitle: 'Адреса, цены и отзывы из открытых каталогов.',
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
            child: TextField(
              controller: _searchController,
              decoration: const InputDecoration(
                labelText: 'Поиск',
                hintText: 'Название или адрес',
                prefixIcon: Icon(Icons.search_rounded),
              ),
              onSubmitted: (value) {
                setState(() {
                  _query = value.trim();
                  _load();
                });
              },
            ),
          ),
          SizedBox(
            height: 44,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              children: [
                _CityChip(
                  label: 'Все',
                  selected: _city == null,
                  onTap: () => setState(() {
                    _city = null;
                    _load();
                  }),
                ),
                ...['almaty', 'astana', 'shymkent', 'karaganda'].map((slug) {
                  final labels = {
                    'almaty': 'Алматы',
                    'astana': 'Астана',
                    'shymkent': 'Шымкент',
                    'karaganda': 'Караганда',
                  };
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: _CityChip(
                      label: labels[slug]!,
                      selected: _city == slug,
                      onTap: () => setState(() {
                        _city = slug;
                        _load();
                      }),
                    ),
                  );
                }),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: AsyncBody<HospitalsResponse>(
              future: _future,
              onRetry: () => setState(_load),
              builder: (context, data) {
                if (data.hospitals.isEmpty) {
                  return Center(
                    child: Text(
                      'Ничего не найдено',
                      style: GoogleFonts.onest(color: AppColors.muted),
                    ),
                  );
                }
                return ListView.separated(
                  padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
                  itemCount: data.hospitals.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final hospital = data.hospitals[index];
                    return HospitalCard(
                      hospital: hospital,
                      onTap: () => Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => HospitalDetailScreen(hospital: hospital),
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _CityChip extends StatelessWidget {
  const _CityChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: selected,
        onSelected: (_) => onTap(),
        showCheckmark: false,
        selectedColor: AppColors.accentSoft,
        labelStyle: GoogleFonts.onest(
          fontWeight: FontWeight.w600,
          color: selected ? AppColors.accentDark : AppColors.muted,
        ),
      ),
    );
  }
}
