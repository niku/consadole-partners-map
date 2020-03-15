import { join } from "path";
import { load, write } from "./data";
import { getJSON } from "./get-json";
import { MatsuyamaHikaruProjectPartner } from "./matsuyama-hikaru-project-partner";

const clubPartnersCSVFilePath = join(__dirname, "..", "assets", "club-partners.csv");

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
