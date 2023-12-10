// ignore_for_file: depend_on_referenced_packages
import 'dart:async';
import 'dart:convert';
import 'package:consadole_partners_map/relationship_partner.dart';
import 'package:consadole_partners_map/relationship_partners_builder.g.dart';
import 'package:http/http.dart' as http;
import 'package:build/build.dart';
import 'package:dart_style/dart_style.dart';
import 'package:latlong2/latlong.dart';
import 'dart:io' show Platform;

Builder geocodesBuilderFactory(BuilderOptions options) {
  return GeocodesBuilder();
}

class GeocodesBuilder implements Builder {
  @override
  Map<String, List<String>> get buildExtensions => const {
        '.dart': ['.g.dart'],
      };

  @override
  FutureOr<void> build(BuildStep buildStep) async {
    final inputId = buildStep.inputId;
    final sink = inputId.changeExtension('.g.dart');

    final Map<String, String> envVars = Platform.environment;
    final appId = envVars['YAHOO_APP_ID'];
    assert(appId != null && appId != '');

    var geocodes = <LatLng, List<RelationshipPartner>>{};
    for (var relationshipPartner in relationshipPartners) {
      if (relationshipPartner.address.isEmpty) {
        continue;
      }
      // https://developer.yahoo.co.jp/webapi/map/openlocalplatform/v1/geocoder.html
      final url = Uri(
          scheme: 'https',
          host: 'map.yahooapis.jp',
          path: '/geocode/V1/geoCoder',
          queryParameters: {
            'output': 'json',
            'appid': appId,
            'query': relationshipPartner.address,
          });
      await Future.delayed(const Duration(seconds: 1)); // サーバー負荷をかけすぎないように1秒待つ
      final response = await http.get(url);
      if (response.statusCode != 200) {
        // ignore: avoid_print
        print(
            'statusCode != 200, statusCode: ${response.statusCode}, address: ${relationshipPartner.address}');
        continue;
      }
      final decodedResponse = jsonDecode(response.body) as Map;
      final resultInfoCount = decodedResponse['ResultInfo']['Count'];
      if (resultInfoCount == 0) {
        // ignore: avoid_print
        print(
            'resultInfoCount == 0, statusCode: ${response.statusCode}, address: ${relationshipPartner.address}, body: ${response.body}');
        continue;
      }

      final feature = (decodedResponse['Feature'] as List).first;
      final geometry = feature['Geometry']['Coordinates'] as String;
      final [longitude, latitude] =
          geometry.split(',').map((e) => double.parse(e)).toList();
      geocodes.update(
          LatLng(latitude, longitude), (list) => list..add(relationshipPartner),
          ifAbsent: () => [relationshipPartner]);
    }

    var converted =
        '''// This code is generated from ${inputId.toString()}. Do not edit.
import 'package:latlong2/latlong.dart';

final Map<LatLng, List<int>> geocodes={
''';

    // 出力結果を安定させるため、key の順番を定めておく
    final keys = geocodes.keys.toList();
    keys.sort((a, b) {
      final latCompare = a.latitude.compareTo(b.latitude);
      if (latCompare != 0) {
        return latCompare;
      }
      return a.longitude.compareTo(b.longitude);
    });
    for (var key in keys) {
      final values = geocodes[key] as List;
      converted = '${converted}LatLng(${key.latitude}, ${key.longitude}): [';
      for (var value in values) {
        converted = '$converted${value.id},';
      }
      converted = '$converted],\n';
    }

    converted = '$converted};';

    await buildStep.writeAsString(sink, DartFormatter().format(converted));
  }
}
