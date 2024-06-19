import { readFileSync } from "fs";
import { join } from "path";
import { validateXML } from "xsd-schema-validator";
import config from "../configLoader";
import { makeSitemap } from "../lib/utils";

async function _validateSitemap(): Promise<boolean> {
	//Generate site map
	await makeSitemap(true, [], [], true);

	/* Loading sitemap.xml */
	const sitemapPath: string = config.sitemapPath;
	const sitemapXML: string = readFileSync(sitemapPath, {
		encoding: "utf8",
	});

	const sitemapSchemaFile: string = join(__dirname, "sitemap-schema.xsd");

	/* Validating */
	try {
		const result = await validateXML(sitemapXML, sitemapSchemaFile);
		return result.valid;
	} catch (err) {
		console.log(err);
		return false;
	}
}

test("Sitemap.xml validation", async () => {
	expect(await _validateSitemap()).toBe(true);
});
