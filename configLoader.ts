import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { ConfigurationOptions } from "./lib/options";

const CONFIG_FILE_NAME = "hawk.config.json";

const projectConfigFile = join(process.cwd(), CONFIG_FILE_NAME);
const projectHasConfig = existsSync(projectConfigFile);

let projectConfig: ConfigurationOptions = {} as ConfigurationOptions;
let defaultConfig: ConfigurationOptions = {} as ConfigurationOptions;

if (projectHasConfig) {
	//load project config
	try {
		projectConfig = JSON.parse(
			readFileSync(projectConfigFile, { encoding: "utf8" }),
		);
	} catch (err) {
		if (err instanceof SyntaxError) {
			console.log(
				"Error: Check configuration file if there any syntax mistake",
			);
		} else {
			console.log("Unexpected Error while loading settings");
		}
		process.exit(1);
	}
}
//load default configuration
defaultConfig = JSON.parse(
	readFileSync(join(__dirname, CONFIG_FILE_NAME), { encoding: "utf8" }),
);

const configurations: ConfigurationOptions = {
	...defaultConfig,
	...projectConfig,
};

export default configurations;
