import { google } from "googleapis";
import { request } from "https";

import {
	GoogleIndexResponseOptions,
	GoogleIndexStatusCode,
	SitemapMeta,
} from "./types";

import config from "../configLoader";
import {
	convertTimeinCTZone,
	lastStateReader,
	lastStateWriter,
} from "./utils";
const { domainName, sitemapPath, serviceAccountFile } = config();

function _callIndexingAPI(
	accessToken: string,
	updatedRoute: string,
): Promise<GoogleIndexResponseOptions> {
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
				const response: GoogleIndexResponseOptions = {
					url: updatedRoute,
					body: JSON.parse(responseBody),
					statusCode: (res.statusCode ?? 0) as GoogleIndexStatusCode,
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
	const callPromises: Promise<GoogleIndexResponseOptions>[] = [];

	const jwtClient = new google.auth.JWT({
		keyFile: serviceAccountFile,
		scopes: ["https://www.googleapis.com/auth/indexing"],
	});

	jwtClient.authorize(async (err, tokens): Promise<void> => {
		if (err) {
			console.log("Error while authorizing for indexing API scope " + err);
			process.exit(1);
		}

		const accessToken: string = tokens?.access_token ?? "";

		stateChangedRoutes.forEach((updatedRoute) => {
			callPromises.push(
				(() => {
					return _callIndexingAPI(accessToken, updatedRoute);
				})(),
			);
		});

		const apiResponses: GoogleIndexResponseOptions[] = await Promise.all(
			callPromises,
		);

		/* Grouping api responses */
		const statusGroups: Record<
			GoogleIndexStatusCode,
			GoogleIndexResponseOptions[]
		> = {
			204: [], //dummy
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

function _sitemapGAPIResponseHandler(
	response: GoogleIndexResponseOptions,
) {
	switch (response.statusCode) {
		case 200:
		case 204:
			console.log("\n✅ Sitemap submitted");
			console.log("Submitted link: ", response.url);
			break;
		case 403:
			console.log(
				"\n🚫 Forbidden | Reason: ",
				response.body.error.message,
			);
			console.log("Failed link: ", response.url);
			break;
		default:
			console.log("\nUnexpected response");
			console.log("Status code: ", response.statusCode);
			console.log("Error message: ", response.body?.error?.message ?? "");
			console.log("Failed link: ", response.url);
	}
}

export function submitSitemapGAPI(): Promise<void> {
	const siteUrl: string = `sc-domain:${domainName}`;
	const sitemapURL: string = `https://${domainName}/${sitemapPath}`;

	const jwtClient = new google.auth.JWT({
		keyFile: serviceAccountFile,
		scopes: ["https://www.googleapis.com/auth/webmasters"],
	});

	return new Promise((resolve, reject) => {
		jwtClient.authorize(async (err, tokens): Promise<void> => {
			if (err) {
				console.log(
					"Error while authorizing for webmasters API scope " + err,
				);
				process.exit(1);
			}

			const accessToken: string = tokens?.access_token ?? "";

			if (!!!accessToken) {
				console.log("Authorization done but access token not found.");
				process.exit(1);
			}

			const options: Record<string, any> = {
				hostname: "www.googleapis.com",

				path: `/webmasters/v3/sites/${encodeURIComponent(
					siteUrl,
				)}/sitemaps/${encodeURIComponent(sitemapURL)}`,

				method: "PUT",

				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Content-Type": "application/json",
				},
			};

			const req = request(options, (res) => {
				let responseBody = "";
				res.on("data", (data) => {
					responseBody += data;
				});

				res.on("end", () => {
					const response: GoogleIndexResponseOptions = {
						url: sitemapURL,
						body: responseBody ? JSON.parse(responseBody) : "",
						statusCode: res.statusCode as GoogleIndexStatusCode,
					};
					_sitemapGAPIResponseHandler(response);

					lastStateWriter({ submittedSitemap: response.url });

					resolve();
				});
			});

			req.on("error", (e) => {
				reject(`Request error: ${e.message}`);
			});

			req.end();
		});
	});
}

export function lastSubmissionStatusGAPI(): Promise<SitemapMeta> {
	const lastSubmittedURL: string = lastStateReader(
		"submittedSitemap",
	) as string;

	if (!lastSubmittedURL) {
		console.log("Record of submission not found");
		process.exit(1);
	}

	const jwtClient = new google.auth.JWT({
		keyFile: serviceAccountFile,
		scopes: ["https://www.googleapis.com/auth/webmasters"],
	});

	return new Promise((resolve, reject) => {
		jwtClient.authorize(async (err, _tokens) => {
			if (err) {
				reject(
					"Authorization error while checking last submission status " +
						err,
				);
			}

			const searchConsole = google.webmasters({
				version: "v3",
				auth: jwtClient,
			});

			const res = await searchConsole.sitemaps.list({
				siteUrl: `sc-domain:${domainName}`,
			});

			const targetedMeta = res.data.sitemap?.find(
				(sitemapMeta) => sitemapMeta.path === lastSubmittedURL,
			);

			if (targetedMeta) {
				//Delete unwanted properties
				delete targetedMeta.path;
				delete targetedMeta.isSitemapsIndex;
				delete targetedMeta.type;
			} else {
				reject("😕 Last submittion status not found");
			}

			const sitemapMeta: SitemapMeta = {
				pageCounts: targetedMeta?.contents
					? parseInt(targetedMeta?.contents[0].submitted ?? "0")
					: 0,

				lastSubmitted: convertTimeinCTZone(
					targetedMeta?.lastSubmitted ?? "",
				),

				lastDownloaded: convertTimeinCTZone(
					targetedMeta?.lastDownloaded ?? "",
				),

				isPending: targetedMeta?.isPending ?? false,
				warnings: parseInt(targetedMeta?.warnings ?? "0"),
				errors: parseInt(targetedMeta?.errors ?? "0"),
			};

			resolve(sitemapMeta);
		});
	});
}
