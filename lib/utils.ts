import {
	existsSync,
	readFileSync,
	statSync,
	writeFileSync,
	rmSync,
} from "fs";
import { globSync } from "glob";
import { toXML as XMLBuilder } from "jstoxml";
import { DateTime } from "luxon";
import { basename, relative } from "path";
import configurations from "../configLoader";
import {
	RouteMetaOptions,
	constants,
	lastStateKeyNames,
	ranStatusFileStructute,
} from "./options";
const { timeZone } = configurations;
/* sitemap oriented function def started */
function _lookupFiles(
	lookupPatterns: string[] = [],
	ignorePattern: string[] = [],
): string[] {
	const webPageFilePaths: string[] = globSync(
		[...configurations.lookupPatterns, ...lookupPatterns],
		{ ignore: [...configurations.ignorePattern, ...ignorePattern] },
	);

	return webPageFilePaths;
}

//modification time provider
function _getModtime(filePath: string): string | null {
	const mTime: number = statSync(filePath).mtime.getTime(); //in epoch
	const ISOTime: string | null = DateTime.fromMillis(mTime)
		.setZone(configurations.timeZone)
		.toISO();
	return ISOTime;
}

export function getRoutesMeta(
	lookupPatterns: string[] = [],
	ignorePattern: string[] = [],
): RouteMetaOptions[] {
	const routesMeta: RouteMetaOptions[] = [] as RouteMetaOptions[];

	_lookupFiles(lookupPatterns, ignorePattern).forEach(
		(filePath: string): void => {
			let relativePath: string = relative(process.cwd(), filePath);

			/* Make web standard path: */

			const pageExtension: string =
				"." + basename(relativePath).split(".").at(-1) ?? "";

			let standardPath: string;

			//remove file extension
			if (pageExtension) {
				standardPath = relativePath.slice(0, -pageExtension.length);
			} else {
				standardPath = relativePath;
			}

			//Keep standard forward slash in url
			standardPath = standardPath.replace(/\\/g, "/");

			//replace /index as / (slash)
			const isRootIndex: boolean = standardPath === "index";
			const isNonRootIndex: boolean = standardPath.endsWith("/index");

			if (isRootIndex || isNonRootIndex) {
				if (isNonRootIndex) {
					standardPath = standardPath.slice(0, -6);
				} else {
					standardPath = "";
				}
			}

			const route: string = `https://${configurations.domainName}/${standardPath}`;

			routesMeta.push({
				route: route,
				modifiedTime: _getModtime(filePath) ?? "null",
			});
		},
	);

	return routesMeta;
}

function _buildUrlObjects(
	routesMeta: RouteMetaOptions[],
): Record<string, any>[] {
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

export function makeSitemap(prettify: boolean = true): string {
	const siteMapRootElem: string = "<?xml version='1.0' encoding='UTF-8'?>";

	const sitemapObject: Record<string, any> = {
		_name: "urlset",
		_attrs: {
			"xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
			"xsi:schemaLocation":
				"http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd",
			xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9",
		},
		_content: _buildUrlObjects(getRoutesMeta()),
	};

	/* Build sitemap xml */
	const siteMapXML: string = XMLBuilder(sitemapObject, {
		header: siteMapRootElem,
		indent: prettify ? "    " : "",
	});

	/* write sitemap.xml */
	try {
		writeFileSync(configurations.sitemapPath, siteMapXML);
		return "Sitemap created";
	} catch (err) {
		console.log("Error while writing sitemap.xml", err);
		process.exit(1);
	}
}

/* Robot.txt oriented functions */
export function makeRobot(): string {
	const robotContent: string = `sitemap: https://${configurations.domainName}/${configurations.sitemapPath}\n`;

	if (existsSync(configurations.robotPath)) {
		let previousContent: string;

		/* Read and load previous content */
		try {
			previousContent = readFileSync(configurations.robotPath, "utf8");
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
				writeFileSync(configurations.robotPath, newRobotContent);
				return `link updated in existing robot.txt`;
			} catch (err) {
				console.log("Error updating sitemap in existing robots.txt:", err);
				process.exit(1);
			}
		} /* This block meant to execute if there is no sitemap in existing robot.txt */ else {
			const newRobotContent: string = robotContent + previousContent;

			/* Adding site map to robot.txt */
			try {
				writeFileSync(configurations.robotPath, newRobotContent);
				return `link added in existing robot.txt`;
			} catch (err) {
				console.log("Error adding sitemap in existing robots.txt:", err);
				process.exit(1);
			}
		}
	} else {
		/* This block meant to execute if there is no robot.txt */

		/* Creating robot.txt and adding sitemap link into it */
		try {
			writeFileSync(configurations.robotPath, robotContent);
			return "robot.txt created and link added into it";
		} catch (err) {
			console.log("Error while creating robot.txt");
			process.exit(1);
		}
	}
}

export function getUpdatedRoutesPath(
	lastRunTimeStamp: number,
	lookupPatterns: string[] = [],
	ignorePattern: string[] = [],
): string[] {
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

	return stateChangedRoutes;
}

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

export function getLastRunTimeStamp(): number {
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

export function convertTimeinCTZone(ISOTime: string): string {
	if (!!!ISOTime) {
		return ISOTime;
	}
	const timeinCTZone: DateTime<true | false> =
		DateTime.fromISO(ISOTime).setZone(timeZone);

	const formatedTime: string = timeinCTZone.toFormat("hh:mm:ss a - DD");
	return formatedTime;
}

export function lastStateWriter(
	newObject: Partial<ranStatusFileStructute>,
): void {
	const previousDataObject: ranStatusFileStructute = JSON.parse(
		readFileSync(constants.ranStatusFile, { encoding: "utf8" }),
	);
	const updatedDataObject: ranStatusFileStructute = {
		...previousDataObject,
		...newObject,
	};
	writeFileSync(
		constants.ranStatusFile,
		JSON.stringify(updatedDataObject, null, 2),
	);
}

export function lastStateReader(
	keyName: lastStateKeyNames,
): string | number {
	const dataObject: ranStatusFileStructute = JSON.parse(
		readFileSync(constants.ranStatusFile, { encoding: "utf8" }),
	);
	return dataObject[keyName];
}
