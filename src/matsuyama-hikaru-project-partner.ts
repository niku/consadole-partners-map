import { load, write, append } from "./data";
import { join } from "path";

const matsuyamaHikaruProjectPartnersCSVFilePath = join(
  __dirname,
  "..",
  "assets",
  "matsuyama-hikaru-project-partners.csv"
);

const matsuyamaHikaruProjectPartnerAddressesCSVFilePath = join(
  __dirname,
  "..",
  "assets",
  "matsuyama-hikaru-project-partner-addresses.csv"
);

export const matsuyamaHikaruProjectPartnersColumnNames: string[] = [
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

export const matsuyamaHikaruProjectPartnerAddressesColumnNames: string[] = ["id", "address"];

export interface MatsuyamaHikaruProjectPartner {
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

export interface MatsuyamaHikaruProjectPartnerAddress {
  readonly id: number;
  readonly address: string;
}

export async function writeMatsuyamaHikaruProjectPartners(
  matsuyamaHikaruProjectPartners: MatsuyamaHikaruProjectPartner[]
): Promise<void> {
  write<MatsuyamaHikaruProjectPartner>(
    matsuyamaHikaruProjectPartnersCSVFilePath,
    matsuyamaHikaruProjectPartnersColumnNames,
    matsuyamaHikaruProjectPartners
  );
}

export function loadMatsuyamaHikaruProjectPartners(): Promise<MatsuyamaHikaruProjectPartner[]> {
  return load<MatsuyamaHikaruProjectPartner>(
    matsuyamaHikaruProjectPartnersCSVFilePath,
    matsuyamaHikaruProjectPartnersColumnNames
  );
}

export function loadMatsuyamaHikaruProjectPartnerAddresses(): Promise<MatsuyamaHikaruProjectPartnerAddress[]> {
  return load<MatsuyamaHikaruProjectPartnerAddress>(
    matsuyamaHikaruProjectPartnerAddressesCSVFilePath,
    matsuyamaHikaruProjectPartnerAddressesColumnNames
  );
}

export async function appendMatsuyamaHikaruProjectPartnerAddresses(
  matsuyamaHikaruProjectPartnerAddress: MatsuyamaHikaruProjectPartnerAddress[]
): Promise<void> {
  append<MatsuyamaHikaruProjectPartnerAddress>(
    matsuyamaHikaruProjectPartnerAddressesCSVFilePath,
    matsuyamaHikaruProjectPartnerAddressesColumnNames,
    matsuyamaHikaruProjectPartnerAddress
  );
}
