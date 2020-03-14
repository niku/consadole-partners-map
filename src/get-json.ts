import { get } from "https";

export async function getJSON<T>(url: URL): Promise<T> {
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
