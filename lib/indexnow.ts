import { Client as FTP } from "basic-ftp";
import { randomBytes } from "crypto";
import { existsSync, readFileSync, rmSync, writeFileSync } from "fs";
import { request } from "https";
import { DateTime } from "luxon";
import configurations from "../configLoader";
import { constants, ranStatusFileStructute } from "./options";
import { getRoutesMeta } from "./utils";
const { timeZone, domainName } = configurations;

function _updateLastRuntimeStamp(
	previousDataObject: ranStatusFileStructute | null = null,
): void {
	const currentTimeStamp: number = DateTime.now()
		.setZone(timeZone)
		.toMillis();

	/* Create new object if previous data object is not passed as a parameter */
	const dataObject: ranStatusFileStructute =
		({ ...previousDataObject } as ranStatusFileStructute) ??
		({
			lastRunTimeStamp: 0,
			secretKey: "",
		} as ranStatusFileStructute);

	/* Updating timestamp */
	dataObject.lastRunTimeStamp = currentTimeStamp;

	try {
		writeFileSync(
			constants.ranStatusFile,
			JSON.stringify(dataObject, null, 2),
		);
	} catch {
		console.log("Error making/updating ran status file");
		process.exit(1);
	}
}

function _lastRunTimeStamp(): number {
	if (existsSync(constants.ranStatusFile)) {
		try {
			const ranStatusObject: ranStatusFileStructute = JSON.parse(
				readFileSync(constants.ranStatusFile, {
					encoding: "utf8",
				}),
			);

			/* Update last run time stamp */
			_updateLastRuntimeStamp(ranStatusObject);

			return ranStatusObject.lastRunTimeStamp;
		} catch (err) {
			console.log("Error getting last run status");
			rmSync(constants.ranStatusFile);
			process.exit(1);
		}
	} /* This block meant to execute if file not exist */ else {
		_updateLastRuntimeStamp();
		return 0;
	}
}

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
				user: "u904769970.cr",
				password: "Darsansm008#",
				host: "154.41.233.80",
			});
			await ftp.uploadFrom(tempkeyfile, keyDestination);
			console.log("KeyFile Uploaded to server 🔑👍🏻");
			ftp.close();

			/* Removing temporary file */
			rmSync(tempkeyfile);

			/* keeping secret key*/
			let newObject: ranStatusFileStructute = ranStatusObject;
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
	lookupPatterns: string[] = [],
	ignorePattern: string[] = [],
): Promise<void> {
	const lastRunTimeStamp: number = _lastRunTimeStamp();

	const stateChangedRoutes: string[] = getRoutesMeta(
		lookupPatterns,
		ignorePattern,
	)
		.filter((routeMeta) => {
			const routeModTimeStamp: number = DateTime.fromISO(
				routeMeta.modifiedTime,
			).toMillis();

			/* return true since the file is modified from the last runtime */
			if (lastRunTimeStamp) {
				if (lastRunTimeStamp < routeModTimeStamp) return true;
				else return false;
			} /* This block meant to execute if there is no last runtime stamp */ else {
				/* Since there is no lastrun time stamp all files are considered as updated */
				return true;
			}
		})
		.map((routeMeta) => routeMeta.route);

	if (stateChangedRoutes.length === 0) {
		console.log("\nNo routes were updated");
		process.exit(0);
	}

	console.log("\nUpdated routes:");
	stateChangedRoutes.forEach((updatedRoute: string) => {
		console.log(updatedRoute);
	});

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
