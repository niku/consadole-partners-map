import { writeFileSync } from "fs";
import { join } from "path";
import { GeoJSON, Feature } from "geojson";

import { appendGeocodings, fetchGeocode, loadGeocodings, Coordinate, Geocoding } from "./geocoding";
import { fetchAllRelationshipPartners, loadRelationshipPartners, writeRelationshipPartners } from "./relation-partner";

async function writeRelationshipPartnersCSV(): Promise<void> {
  fetchAllRelationshipPartners().then(writeRelationshipPartners);
}

async function appendGeocodingsCSV(googleMapsApiKey: string): Promise<void> {
  const sourceAddresses = new Set(loadRelationshipPartners().map(x => x.address));
  const destinationAddresses = new Set(loadGeocodings().map(x => x.address));
  const difference = new Set(sourceAddresses);
  difference.delete(""); // remove empty string from the Set
  for (const elem of destinationAddresses) {
    difference.delete(elem);
  }
  [...difference]
    .reduce(async (previousPromise, address) => {
      const geocodings = await previousPromise;
      return new Promise<Geocoding[]>(resolve =>
        // To avoid API access rate limit
        setTimeout(() => {
          fetchGeocode(googleMapsApiKey, address).then(geocode => {
            let geocoding;
            if (geocode === null) {
              geocoding = {
                address: address,
                latitude: null,
                longitude: null,
              };
            } else {
              geocoding = {
                address: address,
                latitude: geocode.lat,
                longitude: geocode.lng,
              };
            }
            resolve([...geocodings, geocoding]);
          });
        }, 1000)
      );
    }, Promise.resolve<Geocoding[]>([]))
    .then(appendGeocodings);
}

function makeGeoJSON(): GeoJSON {
  const geocoding: { [key: string]: Coordinate } = loadGeocodings().reduce((acc, geocoding) => {
    return {
      ...acc,
      [geocoding.address]: { latitude: geocoding.latitude, longitude: geocoding.longitude },
    };
  }, {});
  const features: Feature[] = loadRelationshipPartners().map(x => {
    const coordinate = geocoding[x.address];
    let geometryOrNull;
    if (coordinate === undefined) {
      geometryOrNull = null;
    } else {
      geometryOrNull = {
        type: "Point",
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        coordinates: [coordinate.longitude!, coordinate.latitude!],
      };
    }
    return {
      type: "Feature",
      geometry: geometryOrNull,
      properties: {
        name: x.name,
        category: x.category,
        region: x.region,
        rank: x.rank,
        work: x.work,
        postalCode: x.postalCode,
        address: x.address,
        phoneNumber: x.phoneNumber,
        url: x.url,
        benefit: x.benefit,
        comment: x.comment,
        continuationYears: x.continuationYears,
      },
    } as Feature;
  });
  return {
    type: "FeatureCollection",
    features: features,
  };
}

function writeGeoJSON(): void {
  const geoJSONFilePath = join(__dirname, "..", "docs", "partners.geojson");
  writeFileSync(geoJSONFilePath, JSON.stringify(makeGeoJSON()));
}

const [, , command] = process.argv;
switch (command) {
  case "writeRelationshipPartnersCSV":
    writeRelationshipPartnersCSV();
    break;
  case "appendGeocodingsCSV":
    const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (googleMapsApiKey) {
      appendGeocodingsCSV(googleMapsApiKey);
    } else {
      console.error("To use geocoding API, set GOOGLE_MAPS_API_KEY to envoronment variables");
    }
    break;
  case "writeGeoJSON":
    writeGeoJSON();
    break;
  default:
    console.error(`'${command} does not match any command`);
}
