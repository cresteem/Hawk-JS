import { google } from "googleapis";

import { type Hawk } from "./core";
import {
	GoogleIndexResponseOptions,
	GoogleIndexStatusCode,
	GoogleJobMediaIndexingPayload,
	LastStateType,
	RanStatusFileStructure,
	SitemapMeta,
} from "./types";

export default class GoogleIndexing {
	#serviceAccountFile: string;
	#sitemapPath: string;
	#domainName: string;

	#lastStateReader: (keyName: keyof LastStateType) => string | number;
	#lastStateWriter: (newObject: Partial<RanStatusFileStructure>) => void;
	#convertTimeinCTZone: (ISOTime: string) => string;

	constructor(hawkInstance: Hawk) {
		const { serviceAccountFile, sitemapPath, domainName } =
			hawkInstance.configurations;

		this.#serviceAccountFile = serviceAccountFile;
		this.#sitemapPath = sitemapPath;
		this.#domainName = domainName;

		const { lastStateReader, lastStateWriter, convertTimeinCTZone } =
			hawkInstance.utils;

		this.#lastStateReader = lastStateReader;
		this.#lastStateWriter = lastStateWriter;
		this.#convertTimeinCTZone = convertTimeinCTZone;
	}

	async #_callIndexingAPI(
		accessToken: string,
		updatedRoute: string,
	): Promise<GoogleIndexResponseOptions> {
		try {
			const postData: GoogleJobMediaIndexingPayload = {
				url: updatedRoute,
				type: "URL_UPDATED",
			};

			const endpoint = process.env.isdev
				? "http://localhost:8080/google-jobmedia-indexing"
				: "https://indexing.googleapis.com/v3/urlNotifications:publish";

			const response = await fetch(endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
				body: JSON.stringify(postData),
			});

			const responseBody = await response.json();

			return {
				url: updatedRoute,
				body: responseBody,
				statusCode: response.status as GoogleIndexStatusCode,
			};
		} catch (error) {
			throw new Error(`Request error: ${error}`);
		}
	}

	async jobMediaIndex(stateChangedRoutes: string[]): Promise<boolean> {
		const callPromises: Promise<GoogleIndexResponseOptions>[] = [];

		const jwtClient = new google.auth.JWT({
			keyFile: this.#serviceAccountFile,
			scopes: ["https://www.googleapis.com/auth/indexing"],
		});

		return new Promise((resolve, _reject) => {
			jwtClient.authorize(async (err, tokens): Promise<void> => {
				if (err) {
					console.log(
						"Error while authorizing for indexing API scope " + err,
					);
					process.exit(1);
				}

				const accessToken: string = tokens?.access_token || "";

				stateChangedRoutes.forEach((updatedRoute) => {
					callPromises.push(
						this.#_callIndexingAPI(accessToken, updatedRoute),
					);
				});

				const apiResponses: GoogleIndexResponseOptions[] =
					await Promise.all(callPromises);

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
					if ([400, 403, 429, 200].includes(response.statusCode)) {
						statusGroups[response.statusCode].push(response);
					}
				});

				if (statusGroups[200].length > 0) {
					console.log("\n✅ Successfully reported routes:");

					console.log(
						statusGroups[200].map((response) => response.url).join("\n"),
					);
				}

				/* Error reports */
				if (
					statusGroups[400].length > 0 ||
					statusGroups[403].length > 0 ||
					statusGroups[429].length > 0
				) {
					const failedResponseCount =
						stateChangedRoutes.length - statusGroups[200].length;

					console.log(
						`\nGoogle response: ⚠️\t${failedResponseCount} of ${stateChangedRoutes.length} failed`,
					);

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
						console.log(
							statusGroups[403].map((response) => response.url).join("\n"),
						);
					}

					if (statusGroups[429].length > 0) {
						console.log(
							"\n🚨 TOO_MANY_REQUESTS - Your quota is exceeding for Indexing API calls",
						);
						console.log("Affected Routes:");
						console.log(
							statusGroups[429].map((response) => response.url).join("\n"),
						);
					}
				}

				resolve(apiResponses.length === statusGroups[200].length);
			});
		});
	}

	webmasterIndex(): Promise<boolean> {
		const siteUrl: string = `sc-domain:${this.#domainName}`;
		const sitemapURL: string = `https://${this.#domainName}/${
			this.#sitemapPath
		}`;

		const jwtClient = new google.auth.JWT({
			keyFile: this.#serviceAccountFile,
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

				const accessToken: string = tokens?.access_token || "";

				if (!Boolean(accessToken)) {
					console.log("Authorization done but access token not found.");
					process.exit(1);
				}

				try {
					const apiUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
						siteUrl,
					)}/sitemaps/${encodeURIComponent(sitemapURL)}`;

					const endpoint = process.env.isdev
						? `http://localhost:8080/webmaster/${encodeURIComponent(
								siteUrl,
						  )}/sitemaps/${encodeURIComponent(sitemapURL)}`
						: apiUrl;

					const response = await fetch(endpoint, {
						method: "PUT",
						headers: {
							Authorization: `Bearer ${accessToken}`,
							"Content-Type": "application/json",
						},
					});

					const responseBody = response.ok ? await response.json() : null;

					const sitemapAPIResponse: GoogleIndexResponseOptions = {
						url: sitemapURL,
						body: responseBody || "",
						statusCode: response.status as GoogleIndexStatusCode,
					};

					// Handle the sitemap response (your custom handler)
					_sitemapGAPIResponseHandler(sitemapAPIResponse);

					// Update the state with the submitted sitemap URL
					this.#lastStateWriter({
						submittedSitemap: sitemapAPIResponse.url,
					});

					resolve(response.ok);
				} catch (error) {
					reject(`Request error: ${error}`);
				}
			});
		});
	}

	webmasterFeedback(): Promise<SitemapMeta> {
		const lastSubmittedURL: string = this.#lastStateReader(
			"submittedSitemap",
		) as string;

		if (!lastSubmittedURL) {
			console.log("No record of submission");
			process.exit(1);
		}

		const jwtClient = new google.auth.JWT({
			keyFile: this.#serviceAccountFile,
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
					siteUrl: `sc-domain:${this.#domainName}`,
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
						? parseInt(targetedMeta?.contents[0]?.submitted ?? "0")
						: 0,

					lastSubmitted: this.#convertTimeinCTZone(
						targetedMeta?.lastSubmitted ?? "",
					),

					lastDownloaded: this.#convertTimeinCTZone(
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
