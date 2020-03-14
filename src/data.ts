import parse from "csv-parse";
import stringify from "csv-stringify";
import { promises as fsPromises } from "fs";
import { dirname } from "path";

export async function write<T>(path: string, columns: string[], data: T[]): Promise<void> {
  await fsPromises.mkdir(dirname(path), { recursive: true });
  return new Promise((resolve, reject) => {
    stringify(data, { columns: columns, header: true }, (err, output) => {
      if (err) {
        return reject(err);
      }
      return resolve(fsPromises.writeFile(path, output));
    });
  });
}

export async function append<T>(path: string, columns: string[], data: T[]): Promise<void> {
  await fsPromises.mkdir(dirname(path), { recursive: true });
  return new Promise((resolve, reject) => {
    // Write the file with header if the file didn't exist
    fsPromises.writeFile(path, columns, { flag: "wx" }).finally(() => {
      stringify(data, { columns: columns }, (err, output) => {
        if (err) {
          return reject(err);
        }
        return resolve(fsPromises.appendFile(path, output));
      });
    });
  });
}

export async function load<T>(path: string, columns: string[]): Promise<T[]> {
  return new Promise((resolve, reject) => {
    fsPromises.readFile(path, { encoding: "utf8" }).then(text => {
      parse(
        text,
        {
          // eslint-disable-next-line @typescript-eslint/camelcase
          from_line: 2,
          columns: columns,
          cast: true,
        },
        (err, output) => {
          if (err) {
            return reject(err);
          }
          return resolve(output);
        }
      );
    });
  });
}
