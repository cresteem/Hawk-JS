import { exec } from "child_process";
import { randomBytes } from "crypto";
import { readFileSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import configuration from "../configLoader";
import { secretObjectStructure } from "../lib/options";
const { secretFile } = configuration;

const secretData: secretObjectStructure = JSON.parse(
	readFileSync(join(process.cwd(), secretFile), { encoding: "utf8" }),
);

export function secretLoadWindows(): void {
	//make batchFile
	const batchScript: string = `setx /M FTPHOST "${secretData.host}"\nsetx /M FTPUSER "${secretData.user}"\nsetx /M FTPPASS "${secretData.pass}"`;

	const batchFile: string = join(
		__dirname,
		`${randomBytes(8).toString("hex")}.bat`,
	);

	writeFileSync(batchFile, batchScript, { encoding: "utf8" });

	//runas admin
	const command: string = `powershell -Command "Start-Process -Verb RunAs '${batchFile}' -Wait -WindowStyle Hidden"`;

	//Execute batchscript
	exec(command, (error, _stdout, stderr) => {
		//delete script
		rmSync(batchFile);

		if (error || stderr) {
			console.log(`Error loading secrets: ${error?.message}`);
		}

		console.log("🔐👍🏻 Secrets loaded successfully");
	});
}
