import { load, write } from "./data";
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

export async function appendGeocodings(geocodings: Geocoding[]): Promise<void> {
  write<Geocoding>(geocodingCSVFilePath, geocodingColumnNames, geocodings);
}

export async function loadGeocodings(): Promise<Geocoding[]> {
  return load<Geocoding>(geocodingCSVFilePath, geocodingColumnNames);
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
    .then(geocodeResponse => geocodeResponse.data.results[0].geometry.location);
}
