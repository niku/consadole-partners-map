import parse from "csv-parse/lib/sync";
import stringify from "csv-stringify/lib/sync";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { Client } from "@googlemaps/google-maps-services-js";

const geocodingCSVFilePath = join(__dirname, "..", "assets", "geocodings.csv");

export const geocodingColumnNames: string[] = ["address", "latitude", "longitude"];

export interface Coordinate {
  readonly latitude: number | null;
  readonly longitude: number | null;
}

export interface Geocoding extends Coordinate {
  readonly address: string;
}

export function appendGeocodings(geocodings: Array<Geocoding>): void {
  writeFileSync(geocodingCSVFilePath, stringify(geocodings, { columns: geocodingColumnNames, header: true }));
}

export function loadGeocodings(): Array<Geocoding> {
  return parse(readFileSync(geocodingCSVFilePath, { encoding: "utf8" }), {
    // eslint-disable-next-line @typescript-eslint/camelcase
    from_line: 2,
    columns: geocodingColumnNames,
    cast: true,
  });
}

export async function fetchGeocode(key: string, address: string): Promise<{ lat: number; lng: number } | null> {
  if (address === "") {
    return null;
  }
  return new Client({})
    .geocode({
      params: {
        key: key,
        address: address,
      },
    })
    .then(geocodeResponse => geocodeResponse.data.results[0]?.geometry?.location);
}
