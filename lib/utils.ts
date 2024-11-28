import { Client as FTP } from "basic-ftp";
import { globSync } from "glob";
import { toXML as XMLBuilder } from "jstoxml";
import { DateTime } from "luxon";
import {
	existsSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import {
	basename,
	dirname,
	extname,
	join,
	relative,
	sep,
} from "node:path";
import {
	ConfigurationOptions,
	constants,
	LastStateType,
	RanStatusFileStructure,
	RouteMeta,
} from "./types";

export default class Utils {
	#configurations: ConfigurationOptions;

	constructor(configurations: ConfigurationOptions) {
		this.#configurations = configurations;
	}

	//modification time provider
	#_getModtime(filePath: string): string | null {
		const mTime: number = statSync(filePath).mtime.getTime(); //in epoch
		const ISOTime: string | null = DateTime.fromMillis(mTime)
			.setZone(this.#configurations.timeZone)
			.toISO();
		return ISOTime;
	}

	getRoutesMeta(
		lookupPatterns: string[],
		ignorePattern: string[],
	): RouteMeta[] {
		const routesMeta: RouteMeta[] = [] as RouteMeta[];

		_lookupFiles(lookupPatterns, ignorePattern).forEach(
			(filePath: string): void => {
				let relativePath: string = relative(process.cwd(), filePath);

				/* Make web standard path: */
				let standardPath: string = `${join(
					dirname(relativePath),
					basename(relativePath, extname(relativePath)),
				)}`;

				//Keep standard forward slash in url
				standardPath = standardPath.split(sep).join("/");

				//replace /index as / (slash)
				const isRootIndex: boolean = standardPath === "index";
				const isNonRootIndex: boolean = standardPath.endsWith("/index");

				if (isRootIndex || isNonRootIndex) {
					standardPath = isNonRootIndex ? standardPath.slice(0, -6) : "";
				}

				const route: string = `https://${
					this.#configurations.domainName
				}/${standardPath}`;

				routesMeta.push({
					route: route,
					modifiedTime: this.#_getModtime(filePath) ?? "null",
				});
			},
		);

		return routesMeta;
	}

	#_buildUrlObjects(routesMeta: RouteMeta[]): Record<string, any>[] {
		const urlElements: Record<string, any>[] = [];

		for (const routeMeta of routesMeta) {
			const urlElement: Record<string, any> = {
				url: {
					loc: routeMeta.route,
					lastmod: routeMeta.modifiedTime,
				},
			};
			urlElements.push(urlElement);
		}
		return urlElements;
	}

	async #_uploadSitemap(): Promise<boolean> {
		const ftp: FTP = new FTP();

		const {
			ftpCredential: { username, password, hostname },
			sitemapPath,
		} = this.#configurations;

		try {
			await ftp.access({
				user: username || process.env.FTPUSER,
				password: password || process.env.FTPPASS,
				host: hostname || process.env.FTPHOST,
			});

			/* Making path relative from root for server */
			const remotePath: string = "/" + sitemapPath;

			await ftp.uploadFrom(sitemapPath, remotePath);

			ftp.close();
			return true;
		} catch (err) {
			return false;
		}
	}

	async makeSitemap(
		lookupPatterns: string[],
		ignorePattern: string[],
		prettify: boolean = false,
		upload: boolean = false,
	): Promise<string> {
		const siteMapRootElem: string =
			"<?xml version='1.0' encoding='UTF-8'?>";

		const sitemapObject: Record<string, any> = {
			_name: "urlset",
			_attrs: {
				"xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
				"xsi:schemaLocation":
					"http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd",
				xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9",
			},
			_content: this.#_buildUrlObjects(
				this.getRoutesMeta(lookupPatterns, ignorePattern),
			),
		};

		/* Build sitemap xml */
		const siteMapXML: string = XMLBuilder(sitemapObject, {
			header: siteMapRootElem,
			indent: prettify ? "    " : "",
		});

		/* write sitemap.xml */
		try {
			writeFileSync(this.#configurations.sitemapPath, siteMapXML);

			if (upload) {
				/* Upload site map to ftp server */
				const uploaded: boolean = await this.#_uploadSitemap();

				if (!uploaded) {
					console.log("👎🏻 Failed to upload sitemap.xml to FTP server");
					process.exit(1);
				}
			}

			return `✅ Sitemap created ${
				upload ? "and uploaded to server" : ""
			}`;
		} catch (err) {
			console.log("Error while writing sitemap.xml", err);
			process.exit(1);
		}
	}

	/* Robot.txt oriented */
	makeRobot(): string {
		const robotContent: string = `sitemap: https://${
			this.#configurations.domainName
		}/${this.#configurations.sitemapPath}\n`;

		if (existsSync(this.#configurations.robotPath)) {
			let previousContent: string;

			/* Read and load previous content */
			try {
				previousContent = readFileSync(
					this.#configurations.robotPath,
					"utf8",
				);
			} catch (err) {
				console.log("Error while reading robot.txt");
				process.exit(1);
			}

			/* Pattern to search and replace */
			const sitemapPattern: string = "sitemap:";

			/* check if sitemap link included in previous content */
			if (previousContent.includes(sitemapPattern)) {
				/* Remove the sitemap link line*/
				let contentSplits: string[] = previousContent.split("\n");

				contentSplits = contentSplits.map((line: string): string => {
					if (line.startsWith(sitemapPattern)) {
						return ""; //removing it
					}
					return line; //leave as it is
				});

				previousContent = contentSplits.join("\n"); //sitemap link removed

				//add new sitemap link and writing file
				const newRobotContent: string = robotContent + previousContent;

				try {
					writeFileSync(this.#configurations.robotPath, newRobotContent);
					return `robot.txt updated`;
				} catch (err) {
					console.log(
						"Error updating sitemap in existing robots.txt:",
						err,
					);
					process.exit(1);
				}
			} else {
				/* This block meant to execute if there is no sitemap in existing robot.txt */
				const newRobotContent: string = robotContent + previousContent;

				/* Adding site map to robot.txt */
				try {
					writeFileSync(this.#configurations.robotPath, newRobotContent);
					return `link added in robot.txt`;
				} catch (err) {
					console.log("Error adding sitemap in existing robots.txt:", err);
					process.exit(1);
				}
			}
		} else {
			/* This block meant to execute if there is no robot.txt */

			/* Creating robot.txt and adding sitemap link into it */
			try {
				writeFileSync(this.#configurations.robotPath, robotContent);
				return "robot.txt created";
			} catch (err) {
				console.log("Error while creating robot.txt");
				process.exit(1);
			}
		}
	}

	getUpdatedRoutesPath(
		lastRunTimeStamp: number,
		lookupPatterns: string[],
		ignorePattern: string[],
	): string[] {
		const stateChangedRoutes: string[] = this.getRoutesMeta(
			lookupPatterns,
			ignorePattern,
		)
			.filter((routeMeta) => {
				const routeModTimeStamp: number = DateTime.fromISO(
					routeMeta.modifiedTime,
				).toMillis();

				/* return true since the file is modified from the last runtime */
				if (lastRunTimeStamp) {
					return lastRunTimeStamp < routeModTimeStamp;
				} else {
					/* This block meant to execute if there is no last runtime stamp */
					/* Since there is no lastrun time stamp all files are considered as updated */
					return true;
				}
			})
			.map((routeMeta) => routeMeta.route);

		if (stateChangedRoutes.length === 0) {
			console.log("\nNo routes were updated");
			process.exit(0);
		} else {
			console.log("\nUpdated routes:\n", stateChangedRoutes.join("\n"));
		}

		return stateChangedRoutes;
	}

	#_updateLastRuntimeStamp(
		previousDataObject: RanStatusFileStructure | null = null,
	): void {
		const currentTimeStamp: number = DateTime.now()
			.setZone(this.#configurations.timeZone)
			.toMillis();

		/* Create new object if previous data object is not passed as a parameter */
		const dataObject: RanStatusFileStructure =
			(previousDataObject as RanStatusFileStructure) ||
			({
				lastRunTimeStamp: 0,
				secretKey: "",
			} as RanStatusFileStructure);

		/* Updating timestamp */
		dataObject.lastRunTimeStamp = currentTimeStamp;

		try {
			writeFileSync(
				constants.ranStatusFile,
				JSON.stringify(dataObject, null, 2),
			);
		} catch (err) {
			console.log("Error updating ran status file", err);
			process.exit(1);
		}
	}

	getLastRunTimeStamp(): number {
		if (existsSync(constants.ranStatusFile)) {
			try {
				const ranStatusObject: RanStatusFileStructure = JSON.parse(
					readFileSync(constants.ranStatusFile, {
						encoding: "utf8",
					}),
				);

				/* Update last run time stamp */
				this.#_updateLastRuntimeStamp(ranStatusObject);

				return ranStatusObject.lastRunTimeStamp;
			} catch (err) {
				console.log("Error getting last run status");
				rmSync(constants.ranStatusFile, { recursive: true, force: true });
				process.exit(1);
			}
		} else {
			/* This block meant to execute if file not exist */
			/* create last run status */
			this.#_updateLastRuntimeStamp();
			return 0;
		}
	}

	convertTimeinCTZone(ISOTime: string): string {
		if (!Boolean(ISOTime)) {
			return ISOTime;
		}

		const timeinCTZone: DateTime<true | false> = DateTime.fromISO(
			ISOTime,
		).setZone(this.#configurations.timeZone);

		const formatedTime: string = timeinCTZone.toFormat("hh:mm:ss a - DD");
		return formatedTime;
	}

	lastStateWriter(newObject: Partial<RanStatusFileStructure>): void {
		let previousDataObject: RanStatusFileStructure;
		try {
			previousDataObject = JSON.parse(
				readFileSync(constants.ranStatusFile, { encoding: "utf8" }),
			);
		} catch (err: any) {
			if (err.code === "ENOENT") {
				previousDataObject = {} as RanStatusFileStructure;
			} else {
				console.log("Unexpected error ", err);
				process.exit(1);
			}
		}

		const updatedDataObject: RanStatusFileStructure = {
			...previousDataObject,
			...newObject,
		};

		writeFileSync(
			constants.ranStatusFile,
			JSON.stringify(updatedDataObject, null, 2),
		);
	}

	lastStateReader(keyName: keyof LastStateType): string | number {
		let dataObject: RanStatusFileStructure;

		try {
			dataObject = JSON.parse(
				readFileSync(constants.ranStatusFile, { encoding: "utf8" }),
			);
		} catch (err: any) {
			if (err.code === "ENOENT") {
				return 0;
			} else {
				console.log("Unexpected error ", err);
				process.exit(1);
			}
		}
		return dataObject[keyName];
	}
}

function _lookupFiles(
	lookupPatterns: string[],
	ignorePatterns: string[],
): string[] {
	const webPageFilePaths: string[] = globSync(lookupPatterns, {
		ignore: [...ignorePatterns, "node_modules/**"],
	});

	return webPageFilePaths;
}
