import { Hawk } from "../lib/core";
import validateSitemap from "./utils/validate-sitemap";

const hawkInstance = new Hawk();
const testSampleRootPath = "./test/test-sample";

test("Sitemap.xml validation", async () => {
	expect(await validateSitemap(testSampleRootPath, hawkInstance)).toBe(
		true,
	);
});
