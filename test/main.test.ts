import { chdir } from "node:process";
import { Hawk } from "../lib/core";
import validateRoutes from "./utils/validate-routes";
import validateSitemap from "./utils/validate-sitemap";

const hawkInstance = new Hawk();
const testSampleRootPath = "./test/test-sample";

const cwd = process.cwd();
afterEach(() => {
	chdir(cwd);
});

test("Sitemap.xml validation", async () => {
	expect(await validateSitemap(testSampleRootPath, hawkInstance)).toBe(
		true,
	);
});

test("Routes validation", () => {
	expect(validateRoutes(testSampleRootPath, hawkInstance)).toBe(true);
});
