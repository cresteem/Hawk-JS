import { chdir } from "node:process";
import { Hawk } from "../lib/core";
import ftpValidator from "./utils/ftp-validator";
import strategyValidator from "./utils/strategy-validator";
import validateRoutes from "./utils/validate-routes";
import validateSitemap from "./utils/validate-sitemap";

const hawkInstance = new Hawk();
const testSampleRootPath = "./test/test-sample";

beforeAll(() => {
	process.env.isdev = "true"; //for strategyValidator

	//delete indexnow key
	hawkInstance.utils.lastStateWriter({ secretKey: "" }); // for ftpValidator
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

test("FTP validation", async () => {
	expect(await ftpValidator(hawkInstance)).toBe(true);
});
