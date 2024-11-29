import { XMLParser } from "fast-xml-parser";
import { globSync } from "glob";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { validateXML } from "xsd-schema-validator";
import { type Hawk } from "../../lib/core";

export default async function validateSitemap(
	hawkInstance: Hawk,
): Promise<boolean> {
	const lookupPattern = ["**/*.html"];
	const uploadToFTP = false;
	const expectedSitemapOutputPath =
		hawkInstance.configurations.sitemapPath;

	await hawkInstance.utils.makeSitemap(
		lookupPattern,
		[],
		false,
		uploadToFTP,
	);

	//check sitemap if exist
	const siteMapExist = existsSync(expectedSitemapOutputPath);

	if (siteMapExist) {
		//validate sitemap with schema
		const sitemapXML: string = readFileSync(expectedSitemapOutputPath, {
			encoding: "utf8",
		});

		//delete sitemap as no longer needed
		rmSync(expectedSitemapOutputPath, { recursive: true, force: true });

		const sitemapSchemaFile = "sitemap-schema.xsd";

		const { valid } = await validateXML(sitemapXML, sitemapSchemaFile);

		if (valid) {
			//check number of available routes against nof available files;
			const parser = new XMLParser();
			const parsed = parser.parse(sitemapXML);

			const urls = parsed.urlset.url.map(
				(url: { loc: string; lastmod: string }) => url.loc,
			);
			const availableRoutes = globSync(lookupPattern);

			const numberOfRoutesinMap = urls.length;
			const numberOfFiles = availableRoutes.length;

			const expectedRoutesCount = numberOfFiles === numberOfRoutesinMap;

			if (expectedRoutesCount) {
				//ping to all routes if any failed return false
				return _pingRoutes(urls);
			}
		} else {
			console.log("⚠️  Sitemap failed at schematic test");
		}
	} else {
		console.log("⚠️  Sitemap not found!");
	}

	return false;
}

function _pingRoutes(urls: string[]): boolean {
	return urls.every((url: string) => {
		let { pathname } = new URL(url);

		if (pathname === "/") pathname = "index";

		const filePath = join(process.cwd(), pathname + ".html");

		const goodRoute = existsSync(filePath);

		if (!goodRoute) {
			console.log(`⚠️  Ping failed on: ${url}`);
		}

		return goodRoute;
	});
}
