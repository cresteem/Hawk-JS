import {
	googleIndex,
	lastSubmissionStatusGAPI,
	submitSitemapGAPI,
} from "./lib/gindex";
import { indexNow } from "./lib/indexnow";
import { SitemapMeta, SuppotredStrategies } from "./lib/types";
import {
	getLastRunTimeStamp,
	getUpdatedRoutesPath,
	makeRobot,
	makeSitemap,
} from "./lib/utils";

/* Free call Exports */
export const hawkStrategy = {
	indexNow: async (routes: string[]) => {
		await indexNow(routes);
	},
	gIndex: async (routes: string[]) => {
		await googleIndex(routes);
	},
	gWebmaster: async (
		prettify: boolean = true,
		lookupPatterns: string[] = [],
		ignorePattern: string[] = [],
	) => {
		await _makeSitemapRobot(prettify, lookupPatterns, ignorePattern);

		await submitSitemapGAPI();
	},
	gWebmaster2: async (
		prettify: boolean = true,
		lookupPatterns: string[] = [],
		ignorePattern: string[] = [],
	) => {
		await _makeSitemapRobot(prettify, lookupPatterns, ignorePattern);

		await submitSitemapGAPI();

		/* check status */
		const statusMeta: SitemapMeta = await lastSubmissionStatusGAPI();
		console.log(statusMeta);
	},
};

export async function hawk(
	strategy: SuppotredStrategies,
	lookupPatterns: string[] = [],
	ignorePattern: string[] = [],
	prettify: boolean = true,
): Promise<void> {
	const lastRunTimeStamp: number = getLastRunTimeStamp();
	const stateChangedRoutes: string[] = getUpdatedRoutesPath(
		lastRunTimeStamp,
		lookupPatterns,
		ignorePattern,
	);

	try {
		await strategyHandler(
			strategy,
			stateChangedRoutes,
			prettify,
			lookupPatterns,
			ignorePattern,
		);
	} catch (err) {
		console.log("Program stopped reason below ⬇️");
		console.log(err);
		process.exit(1);
	}
}

async function _makeSitemapRobot(
	prettify: boolean,
	lookupPatterns: string[] = [],
	ignorePattern: string[] = [],
) {
	/* Create sitemap.xml and robot.txt */
	const sitemapStatus: string = await makeSitemap(
		prettify,
		lookupPatterns,
		ignorePattern,
	);
	const robotTxtStatus: string = makeRobot();
	console.log("\n" + sitemapStatus, " | ", robotTxtStatus);
}

async function strategyHandler(
	strategy: SuppotredStrategies,
	stateChangedRoutes: string[],
	prettify: boolean = true,
	lookupPatterns: string[] = [],
	ignorePattern: string[] = [],
): Promise<void> {
	const strategyLowercase: string = strategy.toLowerCase();
	if (strategyLowercase === "indexnow") {
		/* For Bing, Yahoo, Yandex, Yep, etc */
		await hawkStrategy.indexNow(stateChangedRoutes);
	} else if (strategyLowercase === "gindex") {
		/* For Google - Web page which has JobPosting or Livestream Broadcasting content. */
		await hawkStrategy.gIndex(stateChangedRoutes);
	} else if (strategyLowercase === "gwebmaster") {
		/* For all types of website*/
		await hawkStrategy.gWebmaster(prettify, lookupPatterns, ignorePattern);
	} else if (strategyLowercase === "gwebmaster2") {
		/* For all types of website*/
		await hawkStrategy.gWebmaster2(
			prettify,
			lookupPatterns,
			ignorePattern,
		);
	}
}

export const utilities = {
	lastSubmissionStatusGAPI,
	getUpdatedRoutesPath,
	makeRobot,
	makeSitemap,
	getLastRunTimeStamp,
	_makeSitemapRobot,
};
