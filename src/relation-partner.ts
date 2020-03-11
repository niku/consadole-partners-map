import parse from "csv-parse/lib/sync";
import stringify from "csv-stringify/lib/sync";
import { readFileSync, writeFileSync } from "fs";
import { get } from "https";
import { join } from "path";

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

export interface RelationPartner {
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

async function getJSON<T>(url: URL): Promise<T> {
  return new Promise((resolve, reject) => {
    get(url, res => {
      const { statusCode } = res;
      const contentType = res.headers["content-type"];

      let error;
      if (statusCode !== 200) {
        error = new Error("Request Failed.\n" + `Status Code: ${statusCode}`);
      } else if (contentType == null) {
        error = new Error("No content-type was given.");
      } else if (!/^application\/json/.test(contentType)) {
        error = new Error("Invalid content-type.\n" + `Expected application/json but received ${contentType}`);
      }
      if (error) {
        console.error(error.message);
        // Consume response data to free up memory
        res.resume();
        reject(error);
      }

      res.setEncoding("utf8");
      let rawData = "";
      res.on("data", chunk => {
        rawData += chunk;
      });
      res.on("end", () => {
        try {
          const parsedData = JSON.parse(rawData);
          resolve(parsedData);
        } catch (e) {
          console.error(e.message);
          reject(e);
        }
      });
    }).on("error", e => {
      console.error(`Got error: ${e.message}`);
      reject(e);
    });
  });
}

export async function fetchAllRelationshipPartners(): Promise<Array<RelationPartner>> {
  return Promise.all(
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      .map(n => new URL(`https://site-api.consadole-sapporo.jp/api/partner/support/${n}`))
      .map(url => getJSON<Array<RelationPartner>>(url))
  ).then(all => {
    return all.flat().sort((a, b) => a.id - b.id);
  });
}

export function writeRelationshipPartners(relationshipPartners: Array<RelationPartner>): void {
  writeFileSync(
    relationshipPartnersCSVFilePath,
    stringify(relationshipPartners, { columns: relationshipPartnersColumnNames, header: true })
  );
}

export function loadRelationshipPartners(): Array<RelationPartner> {
  return parse(readFileSync(relationshipPartnersCSVFilePath, { encoding: "utf8" }), {
    // eslint-disable-next-line @typescript-eslint/camelcase
    from_line: 2,
    columns: relationshipPartnersColumnNames,
    cast: true,
  });
}
