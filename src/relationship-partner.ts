import { join } from "path";
import { write, load } from "./data";
import { getJSON } from "./get-json";

const relationshipPartnersCSVFilePath = join(__dirname, "..", "assets", "relationship-partners.csv");

export const relationshipPartnersColumnNames: string[] = [
  "id",
  "name",
  "furigana",
  "category",
  "region",
  "rank",
  "startDate",
  "work",
  "postalCode",
  "address",
  "phoneNumber",
  "url",
  "benefit",
  "comment",
  "isActive",
  "createdAt",
  "updatedAt",
  "updatedBy",
  "continuationYears",
];

export interface RelationshipPartner {
  readonly id: number;
  readonly name: string;
  readonly furigana: string;
  readonly category: string;
  readonly region: string;
  readonly rank: string;
  readonly startDate: string;
  readonly work: string;
  readonly postalCode: string;
  readonly address: string;
  readonly phoneNumber: string;
  readonly url: string;
  readonly benefit: string;
  readonly comment: string;
  readonly isActive: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly updatedBy: number;
  readonly continuationYears: number;
}

export async function fetchAllRelationshipPartners(): Promise<RelationshipPartner[]> {
  return Promise.all(
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      .map(n => new URL(`https://site-api.consadole-sapporo.jp/api/partner/support/${n}`))
      .map(url => getJSON<RelationshipPartner[]>(url))
  ).then(all => all.flat());
}

export async function writeRelationshipPartners(relationshipPartners: RelationshipPartner[]): Promise<void> {
  return write<RelationshipPartner>(
    relationshipPartnersCSVFilePath,
    relationshipPartnersColumnNames,
    relationshipPartners
  );
}

export async function loadRelationshipPartners(): Promise<RelationshipPartner[]> {
  return load<RelationshipPartner>(relationshipPartnersCSVFilePath, relationshipPartnersColumnNames);
}
