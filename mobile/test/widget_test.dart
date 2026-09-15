import 'package:flutter_test/flutter_test.dart';
import 'package:mama_path/main.dart';

void main() {
  testWidgets('App launches', (tester) async {
    await tester.pumpWidget(const MamaPathApp());
    expect(find.text('Mama Path'), findsOneWidget);
  });
}
