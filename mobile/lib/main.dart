import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'screens/shell_screen.dart';
import 'theme/app_theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );
  runApp(const MamaPathApp());
}

class MamaPathApp extends StatelessWidget {
  const MamaPathApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Mama Path',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      home: const ShellScreen(),
    );
  }
}
