import 'package:consadole_partners_map/geocodes_builder.g.dart';
import 'package:consadole_partners_map/relationship_partner.dart';
import 'package:consadole_partners_map/relationship_partners_builder.g.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_map_marker_popup/flutter_map_marker_popup.dart';
import 'package:latlong2/latlong.dart';
import 'package:url_launcher/url_launcher.dart';

final PopupController _popupLayerController = PopupController();

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        // This is the theme of your application.
        //
        // TRY THIS: Try running your application with "flutter run". You'll see
        // the application has a purple toolbar. Then, without quitting the app,
        // try changing the seedColor in the colorScheme below to Colors.green
        // and then invoke "hot reload" (save your changes or press the "hot
        // reload" button in a Flutter-supported IDE, or press "r" if you used
        // the command line to start the app).
        //
        // Notice that the counter didn't reset back to zero; the application
        // state is not lost during the reload. To reset the state, use hot
        // restart instead.
        //
        // This works for code too, not just values: Most code changes can be
        // tested with just a hot reload.
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: MyMap(),
    );
  }
}

class MyMap extends StatefulWidget {
  const MyMap({super.key});

  @override
  State<StatefulWidget> createState() => _MyMapState();
}

class _MyMapState extends State<MyMap> {
  final defaultCenter = const LatLng(43.1, 142.5);
  final double defaultZoom = 8;
  final defaultMaxBounds =
      LatLngBounds(const LatLng(20.0, 122.0), const LatLng(50.0, 154.0));

  @override
  Widget build(BuildContext context) {
    List<Marker> markers = geocodes.entries.map((entry) {
      return _RelationshipPartnerMarker(
          relationshipPartners: relationshipPartners
              .where((element) => entry.value.contains(element.id))
              .toList(),
          point: entry.key,
          child: Builder(
            builder: (context) => Icon(
              Icons.location_pin,
              color: Theme.of(context).colorScheme.secondary,
            ),
          ));
    }).toList();

    return FlutterMap(
      options: MapOptions(
          initialCenter: defaultCenter,
          initialZoom: defaultZoom,
          cameraConstraint: CameraConstraint.contain(bounds: defaultMaxBounds),
          onTap: (_, __) => _popupLayerController
              .hideAllPopups(), // Hide popup when the map is tapped.
          interactionOptions: const InteractionOptions(
            flags: InteractiveFlag.all & ~InteractiveFlag.rotate,
          )),
      children: [
        TileLayer(
          urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          userAgentPackageName: 'com.example.app',
        ),
        PopupMarkerLayer(
            options: PopupMarkerLayerOptions(
                popupController: _popupLayerController,
                markers: markers,
                popupDisplayOptions: PopupDisplayOptions(
                    builder: (BuildContext context, Marker marker) {
                  marker as _RelationshipPartnerMarker;
                  return _MyPopup(
                      relationshipPartners: marker.relationshipPartners);
                }))),
        RichAttributionWidget(
          attributions: [
            TextSourceAttribution(
              'OpenStreetMap contributors',
              onTap: () =>
                  launchUrl(Uri.parse('https://openstreetmap.org/copyright')),
            ),
          ],
        ),
      ],
    );
  }
}

class _RelationshipPartnerMarker extends Marker {
  final List<RelationshipPartner> relationshipPartners;

  const _RelationshipPartnerMarker({
    required this.relationshipPartners,
    required super.point,
    required super.child,
    super.key,
    super.width,
    super.height,
    super.alignment,
    super.rotate,
  }) : super();
}

class _MyPopup extends StatelessWidget {
  final List<RelationshipPartner> relationshipPartners;

  const _MyPopup({required this.relationshipPartners});

  @override
  Widget build(BuildContext context) {
    return Card(
        child: Column(
            mainAxisSize: MainAxisSize.min,
            children: relationshipPartners.map((relationshipPartner) {
              return Table(
                  border: TableBorder.all(),
                  defaultColumnWidth: const IntrinsicColumnWidth(),
                  children: <TableRow>[
                    TableRow(children: <Widget>[
                      TableCell(
                          child: Padding(
                        padding: const EdgeInsets.all(2),
                        child: Text('名称'),
                      )),
                      TableCell(
                          child: Padding(
                        padding: const EdgeInsets.all(2),
                        child: Text(relationshipPartner.name),
                      )),
                    ]),
                    TableRow(children: <Widget>[
                      TableCell(
                          child: Padding(
                        padding: const EdgeInsets.all(2),
                        child: Text('現在のカテゴリー'),
                      )),
                      TableCell(
                          child: Padding(
                        padding: const EdgeInsets.all(2),
                        child: Text(relationshipPartner.rank),
                      )),
                    ]),
                    TableRow(children: <Widget>[
                      TableCell(
                          child: Padding(
                        padding: const EdgeInsets.all(2),
                        child: Text('パートナー継続年数'),
                      )),
                      TableCell(
                          child: Padding(
                        padding: const EdgeInsets.all(2),
                        child: Text(
                            relationshipPartner.continuationYears.toString()),
                      )),
                    ]),
                    TableRow(children: <Widget>[
                      TableCell(
                          child: Padding(
                        padding: const EdgeInsets.all(2),
                        child: Text('職種'),
                      )),
                      TableCell(
                          child: Padding(
                              padding: const EdgeInsets.all(2),
                              child: Text(
                                relationshipPartner.category,
                              ))),
                    ]),
                    TableRow(children: <Widget>[
                      TableCell(
                          child: Padding(
                        padding: const EdgeInsets.all(2),
                        child: Text('住所'),
                      )),
                      TableCell(
                          child: Padding(
                        padding: const EdgeInsets.all(2),
                        child: Text(relationshipPartner.address),
                      )),
                    ]),
                    TableRow(children: <Widget>[
                      TableCell(
                          child: Padding(
                        padding: const EdgeInsets.all(2),
                        child: Text('現在のカテゴリー'),
                      )),
                      TableCell(
                          child: Padding(
                        padding: const EdgeInsets.all(2),
                        child: Text(relationshipPartner.category),
                      )),
                    ]),
                    TableRow(children: <Widget>[
                      TableCell(
                          child: Padding(
                        padding: const EdgeInsets.all(2),
                        child: Text('電話番号'),
                      )),
                      TableCell(
                          child: Padding(
                        padding: const EdgeInsets.all(2),
                        child: Text(relationshipPartner.phoneNumber),
                      )),
                    ]),
                    TableRow(children: <Widget>[
                      TableCell(
                          child: Padding(
                        padding: const EdgeInsets.all(2),
                        child: Text('Web'),
                      )),
                      TableCell(
                          child: Padding(
                              padding: const EdgeInsets.all(2),
                              child: GestureDetector(
                                onTap: () {
                                  final url =
                                      Uri.tryParse(relationshipPartner.url);
                                  if (url != null) {
                                    launchUrl(url);
                                  }
                                },
                                child: Text(relationshipPartner.url,
                                    style: const TextStyle(
                                      color: Colors.blue,
                                      decoration: TextDecoration.underline,
                                    )),
                              ))),
                    ]),
                    TableRow(children: <Widget>[
                      TableCell(
                          child: Padding(
                        padding: const EdgeInsets.all(2),
                        child: Text('会員特典'),
                      )),
                      TableCell(
                          child: Padding(
                        padding: const EdgeInsets.all(2),
                        child: Text(relationshipPartner.benefit),
                      )),
                    ]),
                    TableRow(children: <Widget>[
                      TableCell(
                          child: Padding(
                        padding: const EdgeInsets.all(2),
                        child: Text('一言コメント'),
                      )),
                      TableCell(
                          child: Padding(
                        padding: const EdgeInsets.all(2),
                        child: Text(relationshipPartner.comment),
                      )),
                    ]),
                  ]);
            }).toList()));
  }
}
