import { Client as FTP } from "basic-ftp";
import { randomBytes } from "node:crypto";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { type Hawk } from "./core";
import {
	constants,
	ftpCredentialOptions,
	RanStatusFileStructure,
} from "./types";

export default class IndexNow {
	#ftpCredential: ftpCredentialOptions;
	#domainName: string;

	constructor(hawkInstance: Hawk) {
		const { ftpCredential, domainName } = hawkInstance.configurations;

		this.#ftpCredential = ftpCredential;
		this.#domainName = domainName;
	}

	async trigger(stateChangedRoutes: string[]): Promise<void> {
		const secretKey: Awaited<string> = await this.#_secretKeyManager();

		/*Call Index now API */
		const apiResponse: Awaited<number> = await this.#_callAPI(
			stateChangedRoutes,
			secretKey,
		);

		let response: string;
		switch (apiResponse) {
			case 200:
				response = "✅\tURLs submitted and key validated.";
				break;
			case 202:
				response = "⚠️\tURLs submitted but key validation pending.";
				break;
			case 400:
				response = "👎🏻\tBad request - Invalid format.";
				break;
			case 403:
				response =
					"🔐\tForbidden - Key not valid (key not found, file found but key not in the file).";
				break;
			case 422:
				response =
					"⛔\tUnprocessable Entity - URLs which don’t belong to your host or the key is not matching the schema in the protocol.";
				break;
			case 429:
				response = "🚨\tToo Many Requests.";
				break;
			default:
				response = "😕\tUnexpected response.";
				break;
		}
		console.log("\nIndexNow response: " + response);
	}

	#_makeSecretKey(): string {
		/* Make 32 char hex key */
		return randomBytes(16).toString("hex");
	}

	async #_secretKeyManager(): Promise<string> {
		let ranStatusObject: RanStatusFileStructure =
			{} as RanStatusFileStructure;

		try {
			ranStatusObject = JSON.parse(
				readFileSync(constants.ranStatusFile, { encoding: "utf8" }),
			);
		} catch (err: any) {
			if (err.code === "ENOENT") {
				writeFileSync(
					constants.ranStatusFile,
					JSON.stringify({}, null, 2),
					{
						encoding: "utf8",
					},
				);
			}
		}

		const oldSecretKey: string = ranStatusObject.secretKey ?? "";

		/* This block is meant to execute if there is no key available */
		if (!Boolean(oldSecretKey)) {
			const secretKey: string = this.#_makeSecretKey();

			const tempkeyfile: string = ".hawktemp";
			writeFileSync(tempkeyfile, secretKey);

			/*set secretkey as file name and store in root */
			const keyDestination: string = `/${secretKey}.txt`;

			/* Upload to ftp server */
			const ftp: FTP = new FTP();
			try {
				await ftp.access({
					user: this.#ftpCredential.username || process.env.FTPUSER,
					password: this.#ftpCredential.password || process.env.FTPPASS,
					host: this.#ftpCredential.hostname || process.env.FTPHOST,
				});

				await ftp.uploadFrom(tempkeyfile, keyDestination);

				console.log("KeyFile Uploaded to server 🔑👍🏻");
				ftp.close();

				/* Removing temporary file */
				rmSync(tempkeyfile, { recursive: true, force: true });

				/* keeping secret key*/
				let newObject: RanStatusFileStructure = { ...ranStatusObject };
				newObject.secretKey = secretKey;

				writeFileSync(
					constants.ranStatusFile,
					JSON.stringify(newObject, null, 2),
				);

				return secretKey;
			} catch (err) {
				console.log("Error uploading keyfile: ", err);

				/* Removing temporary file */
				rmSync(tempkeyfile, { recursive: true, force: true });

				process.exit(1);
			}
		} else {
			return oldSecretKey;
		}
	}

	async #_callAPI(
		updatedRoutes: string[],
		secretkey: string,
	): Promise<number> {
		const data = JSON.stringify({
			host: this.#domainName,
			key: secretkey,
			keyLocation: `https://${this.#domainName}/${secretkey}.txt`,
			urlList: updatedRoutes,
		});

		try {
			const response = await fetch("https://api.indexnow.org/IndexNow", {
				method: "POST",
				headers: {
					"Content-Type": "application/json; charset=utf-8",
				},
				body: data,
			});

			return response.status; // Return the HTTP status code
		} catch (error) {
			const errorMsg = "Error while making API request";
			console.error(errorMsg, error);
			throw new Error(errorMsg);
		}
	}
}
