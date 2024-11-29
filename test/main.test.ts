import { chdir } from "node:process";
import { Hawk } from "../lib/core";
import strategyValidator from "./utils/strategy-validator";
import validateRoutes from "./utils/validate-routes";
import validateSitemap from "./utils/validate-sitemap";

const hawkInstance = new Hawk();
const testSampleRootPath = "./test/test-sample";

beforeAll(() => {
	process.env.isdev = "true"; //for strategyValidator
});

beforeEach(() => {
	chdir(testSampleRootPath);
});

const cwd = process.cwd();
afterEach(() => {
	chdir(cwd);
});

test("Sitemap.xml validation", async () => {
	expect(await validateSitemap(hawkInstance)).toBe(true);
});

test("Routes validation", () => {
	expect(validateRoutes(hawkInstance)).toBe(true);
});

test("Strategy validation", async () => {
	expect(await strategyValidator(hawkInstance)).toBe(true);
});
