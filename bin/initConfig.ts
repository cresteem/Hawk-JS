import { copyFileSync } from "node:fs";
import { join } from "node:path";

export default function initConfig() {
	const sourceConfig = join(__dirname, "userconfig-template.js");
	const dest = join(process.cwd(), "hawk.config.js");
	copyFileSync(sourceConfig, dest);
}
