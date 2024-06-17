import { request } from "https";
import { google } from "googleapis";
import key from "../gserv.json";
import {
	googleIndexResponseOptions,
	googleIndexStatusCode,
} from "./options";

function _callAPI(
	accessToken: string,
	updatedRoute: string,
): Promise<googleIndexResponseOptions> {
	return new Promise((resolve, reject) => {
		const postData: string = JSON.stringify({
			url: updatedRoute,
			type: "URL_UPDATED",
		});

		const options: Record<string, string | Record<string, string>> = {
			hostname: "indexing.googleapis.com",
			path: "/v3/urlNotifications:publish",
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${accessToken}`,
			},
		};

		const req = request(options, (res) => {
			let responseBody = "";
			res.on("data", (data) => {
				responseBody += data;
			});
			res.on("end", () => {
				const response: googleIndexResponseOptions = {
					url: updatedRoute,
					body: JSON.parse(responseBody),
					statusCode: (res.statusCode ?? 0) as googleIndexStatusCode,
				};
				resolve(response);
			});
		});

		req.on("error", (e) => {
			reject(`Request error: ${e.message}`);
		});

		req.write(postData);
		req.end();
	});
}

export async function googleIndex(stateChangedRoutes: string[]) {
	const callPromises: Promise<googleIndexResponseOptions>[] = [];

	const jwtClient = new google.auth.JWT(
		key.client_email,
		undefined,
		key.private_key,
		["https://www.googleapis.com/auth/indexing"],
		undefined,
	);

	jwtClient.authorize(async (err, tokens): Promise<void> => {
		if (err) {
			console.log("Error while authorizing for indexing API scope " + err);
			process.exit(1);
		}

		const accessToken: string = tokens?.access_token ?? "";

		stateChangedRoutes.forEach((updatedRoute) => {
			callPromises.push(
				(() => {
					return _callAPI(accessToken, updatedRoute);
				})(),
			);
		});

		const apiResponses: googleIndexResponseOptions[] = await Promise.all(
			callPromises,
		);

		/* Grouping api responses */
		const statusGroups: Record<
			googleIndexStatusCode,
			googleIndexResponseOptions[]
		> = {
			400: [],
			403: [],
			429: [],
			200: [],
		};

		apiResponses.forEach((response) => {
			if (response.statusCode === 400) {
				statusGroups[400].push(response);
			} else if (response.statusCode === 403) {
				statusGroups[403].push(response);
			} else if (response.statusCode === 429) {
				statusGroups[429].push(response);
			} else if (response.statusCode === 200) {
				statusGroups[200].push(response);
			}
		});

		console.log(
			`\nGoogle response: ⚠️\t${
				stateChangedRoutes.length - statusGroups[200].length
			}/${stateChangedRoutes.length} failed`,
		);

		if (statusGroups[200].length > 0) {
			console.log("\n✅ Successful Routes:");
			statusGroups[200].forEach((response) => {
				console.log(response.url);
			});
		}

		/* Error reports */
		if (
			statusGroups[400].length > 0 ||
			statusGroups[403].length > 0 ||
			statusGroups[429].length > 0
		) {
			console.log("\n###Google Indexing error reports:⬇️");
			if (statusGroups[400].length > 0) {
				console.log("\n👎🏻 BAD_REQUEST");
				console.log("Affected Routes:");
				statusGroups[400].forEach((response) => {
					console.log(
						response.url,
						"\t|\t",
						"Reason: " + response.body.error.message,
					);
				});
			}

			if (statusGroups[403].length > 0) {
				console.log("\n🚫 FORBIDDEN - Ownership verification failed");
				console.log("Affected Routes:");
				statusGroups[403].forEach((response) => {
					console.log(response.url);
				});
			}

			if (statusGroups[429].length > 0) {
				console.log(
					"\n🚨 TOO_MANY_REQUESTS - Your quota is exceeding for Indexing API calls",
				);
				console.log("Affected Routes:");
				statusGroups[429].forEach((response) => {
					console.log(response.url);
				});
			}
		}
	});
}
