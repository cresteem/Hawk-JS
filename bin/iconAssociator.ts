import { readFile, writeFile } from "fs/promises";
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const defaultConfigPaths: Record<string, string> = {
	win32: `${process.env.APPDATA}/Code/User/settings.json`,
	darwin: `${process.env.HOME}/Library/Application/Code/User/settings.json`,
	linux: `${process.env.HOME}/.config/Code/User/settings.json`,
};

const userSettings: string = defaultConfigPaths[process.platform];

function getSettingObject(
	configPath: string,
): Promise<Record<string, any>> {
	return new Promise((resolve, reject) => {
		readFile(configPath, { encoding: "utf8" })
			.then((currentConfigs: string) => {
				const configObject: Record<string, any> =
					JSON.parse(currentConfigs);

				resolve(configObject);
			})
			.catch((err) => {
				reject("Error Reading Configuration \n" + err);
			});
	});
}

function appendSettings(
	configObject: Record<string, any>,
	configPath: string,
): Promise<void> {
	const currentSettings: Record<string, any> = configObject;

	const iconAssociationObject = {
		"material-icon-theme.files.associations": {
			"hawk.config.ts": "../../icons/hawkjs-icon",
			"hawk.config.js": "../../icons/hawkjs-icon",
			"hawk.config.mjs": "../../icons/hawkjs-icon",
			"hawk.config.cjs": "../../icons/hawkjs-icon",
		},
	};

	/* Associate icon to configuration file. */
	copyHawkJSIcon();
	const newConfigs = { ...currentSettings, ...iconAssociationObject };
	/*  */

	return new Promise((resolve, reject) => {
		writeFile(configPath, JSON.stringify(newConfigs, null, 3))
			.then(() => {
				resolve();
			})
			.catch((err) => {
				reject(err);
			});
	});
}

export default function writeSettings(): Promise<void> {
	return new Promise(async (resolve, reject) => {
		try {
			const configObject: Record<string, any> = await getSettingObject(
				userSettings,
			);

			appendSettings(configObject, userSettings)
				.then(resolve)
				.catch(reject);
		} catch (err: any) {
			reject("Error while asociating hawk.js icon with config\n" + err);
		}
	});
}

function copyHawkJSIcon(): void {
	const userHome: string = (
		process.platform === "win32"
			? join(process.env.HOMEDRIVE ?? "", process.env.HOMEPATH ?? "")
			: process.env.HOME
	) as string;

	const destPath = join(
		userHome,
		".vscode",
		"extensions",
		"icons",
		"hawkjs-icon.svg",
	);

	const source = join(__dirname, "..", "..", "logo", "hawkjs-icon.svg");

	try {
		mkdirSync(dirname(destPath), { recursive: true });
		copyFileSync(source, destPath);
	} catch (err) {
		console.log("Error copying icon: ", err);
		process.exit(1);
	}
}
