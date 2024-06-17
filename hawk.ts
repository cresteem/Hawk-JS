import { suppotredStrategies, sitemapMetaOptions } from "./lib/options";
import {
	googleIndex,
	lastSubmissionStatusGAPI,
	submitSitemapGAPI,
} from "./lib/gindex";
import { indexNow } from "./lib/indexnow";
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
	gWebmaster: async () => {
		await submitSitemapGAPI();
	},
	gWebmaster2: async () => {
		await submitSitemapGAPI();

		/* check status */
		const statusMeta: sitemapMetaOptions =
			await lastSubmissionStatusGAPI();
		console.log(statusMeta);
	},
};

export async function hawk(
	strategy: suppotredStrategies,
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

	/* Create sitemap.xml and robot.txt */
	const sitemapStatus: string = await makeSitemap(prettify);
	const robotTxtStatus: string = makeRobot();
	console.log("\n" + sitemapStatus, " | ", robotTxtStatus);

	try {
		await strategyHandler(strategy, stateChangedRoutes);
	} catch (err) {
		console.log("Program stopped reason below ⬇️");
		console.log(err);
		process.exit(1);
	}
}

async function strategyHandler(
	strategy: suppotredStrategies,
	stateChangedRoutes: string[],
): Promise<void> {
	if (strategy === "IndexNow") {
		/* For Bing, Yahoo, Yandex, Yep, etc */
		await hawkStrategy.indexNow(stateChangedRoutes);
	} else if (strategy === "GIndex") {
		/* For Google - Web page which has JobPosting or Livestream Broadcasting content. */
		await hawkStrategy.gIndex(stateChangedRoutes);
	} else if (strategy === "GWebmaster") {
		/* For all types of website*/
		await hawkStrategy.gWebmaster();
	} else if (strategy === "GWebmaster2") {
		/* For all types of website*/
		await hawkStrategy.gWebmaster2();
	}
}

hawk("GWebmaster2");
