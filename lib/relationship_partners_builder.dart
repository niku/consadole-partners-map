// ignore_for_file: depend_on_referenced_packages
import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:build/build.dart';
import 'package:dart_style/dart_style.dart';

Builder relationshipPartnersBuilderFactory(BuilderOptions options) {
  return RelationshipPartnersBuilder();
}

class RelationshipPartnersBuilder implements Builder {
  @override
  Map<String, List<String>> get buildExtensions => const {
        '.dart': ['.g.dart'],
      };

  @override
  FutureOr<void> build(BuildStep buildStep) async {
    final inputId = buildStep.inputId;
    final sink = inputId.changeExtension('.g.dart');

    final partnerUrls = [
      "https://site-api.consadole-sapporo.jp/api/partner/support/1", // 飲食・食品
      "https://site-api.consadole-sapporo.jp/api/partner/support/2", // 病院・医療
      "https://site-api.consadole-sapporo.jp/api/partner/support/3", // 卸売・小売
      "https://site-api.consadole-sapporo.jp/api/partner/support/4", // 建設関係
      "https://site-api.consadole-sapporo.jp/api/partner/support/5", // 新聞販売
      "https://site-api.consadole-sapporo.jp/api/partner/support/6", // 法律関係
      "https://site-api.consadole-sapporo.jp/api/partner/support/7", // 観光
      "https://site-api.consadole-sapporo.jp/api/partner/support/8", // 不動産業
      "https://site-api.consadole-sapporo.jp/api/partner/support/9", // 金融期間
      "https://site-api.consadole-sapporo.jp/api/partner/support/10", // その他
    ];

    var elements = [];

    for (var partnerUrl in partnerUrls) {
      // Get json from the server
      final url = Uri.parse(partnerUrl);
      await Future.delayed(const Duration(seconds: 1)); // サーバー負荷をかけすぎないように1秒待つ
      final responseBody = await http.read(url);
      final decodedResponse = jsonDecode(responseBody) as List;
      elements.addAll(decodedResponse);
    }

    // 全ての URL から収集したデータを ID 順にソートして、生成コードを安定させる
    elements.sort((a, b) {
      final aVal = a["id"];
      final bVal = b["id"];
      return aVal.compareTo(bVal);
    });

    // Make code as String
    final relationshipPartnersAsString =
        elements.map((element) => '''RelationshipPartner(
  id: ${f(element["id"])},
  name: ${f(element["name"])},
  furigana: ${f(element["furigana"])},
  category: ${f(element["category"])},
  region: ${f(element["region"])},
  rank: ${f(element["rank"])},
  startDate: ${f(element["startDate"])},
  work: ${f(element["work"])},
  postalCode: ${f(element["postalCode"])},
  address: ${f(element["address"])},
  phoneNumber: ${f(element["phoneNumber"])},
  url: ${f(element["url"])},
  benefit: ${f(element["benefit"])},
  comment: ${f(element["comment"])},
  isActive: ${f(element["isActive"])},
  createdAt: ${f(element["createdAt"])},
  updatedAt: ${f(element["updatedAt"])},
  updatedBy: ${f(element["updatedBy"])},
  continuationYears: ${f(element["continuationYears"])},
)''');

    var converted =
        '''// This code is generated from ${inputId.toString()}. Do not edit.
import 'package:consadole_partners_map/relationship_partner.dart';

final List<RelationshipPartner> relationshipPartners=[
''';

    for (var element in relationshipPartnersAsString) {
      // ..., RelationshipPartner(id: ..., name: ...),
      converted = "$converted$element,";
    }

    converted = '$converted];';

    // Write code
    await buildStep.writeAsString(sink, DartFormatter().format(converted));
  }

  /// format value
  dynamic f(dynamic value) {
    if (value == null) {
      // null は空文字列で表現しておく
      // コードでの表現なので、 ' でかこって文字をリテラルで表す
      return "''";
    }
    switch (value.runtimeType) {
      case const (String):
        // コード生成のときに String リテラルとして '...' という形式を採用している
        // ... の部分に ' があると String リテラルが閉じてしまい不正なコードになってしまうので ' を \' へと変換する
        final singleQuoteEscapedVal = value.replaceAll(RegExp("'"), "\\'");
        // コードでの表現なので、 ' でかこって文字をリテラルで表す
        return "'$singleQuoteEscapedVal'";
      default:
        return value;
    }
  }
}
