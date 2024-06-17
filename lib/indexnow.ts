import { Client as FTP } from "basic-ftp";
import { randomBytes } from "crypto";
import { readFileSync, rmSync, writeFileSync } from "fs";
import { request } from "https";
import configurations from "../configLoader";
import { constants, ranStatusFileStructute } from "./options";
const { domainName } = configurations;

function _makeSecretKey(): string {
	/* Make 32 char hex key */
	return randomBytes(16).toString("hex");
}

async function _secretKeyManager(): Promise<string> {
	const ranStatusObject = JSON.parse(
		readFileSync(constants.ranStatusFile, { encoding: "utf8" }),
	);

	const oldSecretKey: string = ranStatusObject.secretKey ?? "";

	/* This block is meant to execute if there is no key available */
	if (!!!oldSecretKey) {
		const secretKey: string = _makeSecretKey();

		const tempkeyfile: string = ".hawktemp";
		writeFileSync(tempkeyfile, secretKey);

		/*set secretkey as file name and store in root */
		const keyDestination: string = `/${secretKey}.txt`;

		/* Upload to ftp server */
		const ftp: FTP = new FTP();
		try {
			await ftp.access({
				user: configurations.ftpCredential.username,
				password: configurations.ftpCredential.password,
				host: configurations.ftpCredential.hostname,
			});
			await ftp.uploadFrom(tempkeyfile, keyDestination);
			console.log("KeyFile Uploaded to server 🔑👍🏻");
			ftp.close();

			/* Removing temporary file */
			rmSync(tempkeyfile);

			/* keeping secret key*/
			let newObject: ranStatusFileStructute = { ...ranStatusObject };
			newObject.secretKey = secretKey;
			writeFileSync(
				constants.ranStatusFile,
				JSON.stringify(newObject, null, 2),
			);

			return secretKey;
		} catch (err) {
			console.log("Error uploading keyfile: ", err);

			/* Removing temporary file */
			rmSync(tempkeyfile);

			process.exit(1);
		}
	} else {
		return oldSecretKey;
	}
}

function _callAPI(
	updatedRoutes: string[],
	secretkey: string,
): Promise<number> {
	const data: string = JSON.stringify({
		host: domainName,
		key: secretkey,
		keyLocation: `https://${domainName}/${secretkey}.txt`,
		urlList: updatedRoutes,
	});

	const options: Record<string, any> = {
		hostname: "api.indexnow.org",
		port: 443,
		path: "/IndexNow",
		method: "POST",
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Content-Length": Buffer.byteLength(data, "utf8"),
		},
	};

	return new Promise((resolve: Function, reject: Function) => {
		const req = request(options, (res) => {
			res.on("data", () => {});
			res.on("end", () => {
				resolve(res.statusCode);
			});
		});

		req.on("error", (e) => {
			const errorMsg: string = "Error while making api request";
			console.log(errorMsg, e);
			reject(errorMsg);
		});

		req.write(data);
		req.end();
	});
}

export async function indexNow(
	stateChangedRoutes: string[],
): Promise<void> {
	const secretKey: Awaited<string> = await _secretKeyManager();

	/*Call Index now API */
	const apiResponse: Awaited<number> = await _callAPI(
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
