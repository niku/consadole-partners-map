import { join } from "path";
import { load, write, append } from "./data";
import { getJSON } from "./get-json";
import { MatsuyamaHikaruProjectPartner } from "./matsuyama-hikaru-project-partner";

const clubPartnersCSVFilePath = join(__dirname, "..", "assets", "club-partners.csv");

const clubPartnerAddressesCSVFilePath = join(__dirname, "..", "assets", "club-partner-addresses.csv");

export const clubPartnersColumnNames: string[] = [
  "id",
  "year",
  "category",
  "name",
  "furigana",
  "startDate",
  "imagePath",
  "url",
  "isActive",
  "createdAt",
  "updatedAt",
  "updatedBy",
];

export const clubPartnerAddressesColumnNames: string[] = ["id", "address"];

interface ClubPartner {
  readonly id: number;
  readonly year: number;
  readonly category: number;
  readonly name: string;
  readonly furigana: string;
  readonly startDate: string;
  readonly imagePath: string;
  readonly url: string;
  readonly isActive: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly updatedBy: number;
}

export interface ClubPartnerAddress {
  readonly id: number;
  readonly address: string;
}

export async function fetchClubAndMatsuyamaHikaruProjectPartners(): Promise<{
  club: ClubPartner[];
  plan: MatsuyamaHikaruProjectPartner[];
}> {
  const url = new URL("https://site-api.consadole-sapporo.jp/api/partner");
  return getJSON<{ club: ClubPartner[]; plan: MatsuyamaHikaruProjectPartner[] }>(url);
}

export async function writeClubPartners(clubPartners: ClubPartner[]): Promise<void> {
  write<ClubPartner>(clubPartnersCSVFilePath, clubPartnersColumnNames, clubPartners);
}

export async function loadClubPartners(): Promise<ClubPartner[]> {
  return load<ClubPartner>(clubPartnersCSVFilePath, clubPartnersColumnNames);
}

export function loadclubPartnerAddresses(): Promise<ClubPartnerAddress[]> {
  return load<ClubPartnerAddress>(clubPartnerAddressesCSVFilePath, clubPartnerAddressesColumnNames);
}

export async function appendclubPartnerAddresses(clubPartnerAddress: ClubPartnerAddress[]): Promise<void> {
  append<ClubPartnerAddress>(clubPartnerAddressesCSVFilePath, clubPartnerAddressesColumnNames, clubPartnerAddress);
}
