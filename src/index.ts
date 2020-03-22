import { writeFileSync } from "fs";
import { join } from "path";
import { GeoJSON, Feature } from "geojson";

import { appendGeocodings, fetchGeocode, loadGeocodings, Coordinate, Geocoding } from "./geocoding";
import {
  fetchAllRelationshipPartners,
  loadRelationshipPartners,
  writeRelationshipPartners,
} from "./relationship-partner";
import {
  fetchClubAndMatsuyamaHikaruProjectPartners,
  writeClubPartners,
  loadClubPartners,
  loadclubPartnerAddresses,
  appendclubPartnerAddresses,
} from "./club-partner";
import {
  writeMatsuyamaHikaruProjectPartners,
  loadMatsuyamaHikaruProjectPartners,
  loadMatsuyamaHikaruProjectPartnerAddresses,
  appendMatsuyamaHikaruProjectPartnerAddresses,
} from "./matsuyama-hikaru-project-partner";

async function writeRelationshipPartnersCSV(): Promise<void> {
  fetchAllRelationshipPartners()
    .then(partners => partners.sort((a, b) => a.id - b.id))
    .then(writeRelationshipPartners);
}

async function writeClubAndMatsuyamaHikaruProjectPartnersCSV(): Promise<void> {
  fetchClubAndMatsuyamaHikaruProjectPartners().then(json => {
    writeClubPartners(json.club.sort((a, b) => a.id - b.id));
    writeMatsuyamaHikaruProjectPartners(json.plan.sort((a, b) => a.id - b.id));
  });
}

async function appendMatsuyamaHikaruProjectPartnerAddressesCSV(): Promise<void> {
  const source = new Set((await loadMatsuyamaHikaruProjectPartners()).map(x => x.id));
  const destination = new Set((await loadMatsuyamaHikaruProjectPartnerAddresses()).map(x => x.id));
  const difference = new Set(source);
  for (const elem of destination) {
    difference.delete(elem);
  }
  appendMatsuyamaHikaruProjectPartnerAddresses(
    [...difference]
      .sort((a, b) => a - b)
      .map(x => {
        return { id: x, address: "" };
      })
  );
}

async function appendClubPartnerAddressesCSV(): Promise<void> {
  const source = new Set((await loadClubPartners()).map(x => x.id));
  const destination = new Set((await loadclubPartnerAddresses()).map(x => x.id));
  const difference = new Set(source);
  for (const elem of destination) {
    difference.delete(elem);
  }
  appendclubPartnerAddresses(
    [...difference]
      .sort((a, b) => a - b)
      .map(x => {
        return { id: x, address: "" };
      })
  );
}

async function appendGeocodingsCSV(googleMapsApiKey: string): Promise<void> {
  const relationshipPartnerAddresses = new Set((await loadRelationshipPartners()).map(x => x.address));
  const matsuyamaHikaruProjectPartnerAddresses = new Set(
    (await loadMatsuyamaHikaruProjectPartnerAddresses()).map(x => x.address)
  );
  const sourceAddresses = new Set<string>([]);
  for (const relationshipPartnerAddress of relationshipPartnerAddresses) {
    sourceAddresses.add(relationshipPartnerAddress);
  }
  for (const matsuyamaHikaruProjectPartnerAddress of matsuyamaHikaruProjectPartnerAddresses) {
    sourceAddresses.add(matsuyamaHikaruProjectPartnerAddress);
  }
  const destinationAddresses = new Set((await loadGeocodings()).map(x => x.address));
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
        }, 100)
      );
    }, Promise.resolve<Geocoding[]>([]))
    .then(appendGeocodings);
}

async function makeMatsuyamaHikaruProjectPartnersGeoJSON(): Promise<GeoJSON> {
  const geocoding: { [key: string]: Coordinate } = (await loadGeocodings()).reduce((acc, geocoding) => {
    return {
      ...acc,
      [geocoding.address]: { latitude: geocoding.latitude, longitude: geocoding.longitude },
    };
  }, {});
  const addresses: { [key: number]: string } = (await loadMatsuyamaHikaruProjectPartnerAddresses()).reduce(
    (acc, address) => {
      return {
        ...acc,
        [address.id]: address.address,
      };
    },
    {}
  );
  const features: Feature[] = (await loadMatsuyamaHikaruProjectPartners()).map(x => {
    const address = addresses[x.id];
    const coordinate = geocoding[address];
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
        url: x.url,
        address: address,
      },
    } as Feature;
  });
  return {
    type: "FeatureCollection",
    features: features,
  };
}

async function makeGeoJSON(): Promise<GeoJSON> {
  const geocoding: { [key: string]: Coordinate } = (await loadGeocodings()).reduce((acc, geocoding) => {
    return {
      ...acc,
      [geocoding.address]: { latitude: geocoding.latitude, longitude: geocoding.longitude },
    };
  }, {});
  const features: Feature[] = (await loadRelationshipPartners()).map(x => {
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

async function writeGeoJSON(): Promise<void> {
  const geoJSONFilePath = join(__dirname, "..", "docs", "partners.geojson");
  writeFileSync(geoJSONFilePath, JSON.stringify(await makeGeoJSON(), null, 2));

  const matsuyamaHikaruProjectPartnersGeoJSONFilePath = join(
    __dirname,
    "..",
    "docs",
    "matsuyama-hikaru-project-partners.geojson"
  );
  writeFileSync(
    matsuyamaHikaruProjectPartnersGeoJSONFilePath,
    JSON.stringify(await makeMatsuyamaHikaruProjectPartnersGeoJSON(), null, 2)
  );
}

const [, , command] = process.argv;
switch (command) {
  case "writeRelationshipPartnersCSV":
    writeRelationshipPartnersCSV();
    break;
  case "writeClubAndMatsuyamaHikaruProjectPartnersCSV":
    writeClubAndMatsuyamaHikaruProjectPartnersCSV();
    break;
  case "appendMatsuyamaHikaruProjectPartnerAddressesCSV":
    appendMatsuyamaHikaruProjectPartnerAddressesCSV();
    break;
  case "appendClubPartnerAddressesCSV":
    appendClubPartnerAddressesCSV();
    break;
  case "appendGeocodingsCSV":
    const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (googleMapsApiKey) {
      appendGeocodingsCSV(googleMapsApiKey);
    } else {
      console.error("To use geocoding API, set GOOGLE_MAPS_API_KEY to envoronment variables");
    }
    break;
  case "makeMatsuyamaHikaruProjectPartnersGeoJSON":
    makeMatsuyamaHikaruProjectPartnersGeoJSON();
    break;
  case "writeGeoJSON":
    writeGeoJSON();
    break;
  default:
    console.error(`'${command} does not match any command`);
}
