import { hawkStrategies, sitemapMetaOptions } from "./lib/options";
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

export async function hawk(
	strategy: hawkStrategies,
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
	const sitemapStatus: string = makeSitemap(prettify);
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
	strategy: hawkStrategies,
	stateChangedRoutes: string[],
): Promise<void> {
	if (strategy === "IndexNow") {
		/* For Bing, Yahoo, Yandex, Yep, etc */
		await indexNow(stateChangedRoutes);
	} else if (strategy === "GIndex") {
		/* For Google - Web page which has JobPosting or Livestream Broadcasting content. */
		await googleIndex(stateChangedRoutes);
	} else if (strategy === "GWebmaster") {
		/* For all types of website*/
		await submitSitemapGAPI();
	} else if (strategy === "GWebmaster2") {
		/* For all types of website*/
		await submitSitemapGAPI();

		/* check status */
		const statusMeta: sitemapMetaOptions =
			await lastSubmissionStatusGAPI();
		console.log(statusMeta);
	}
}

hawk("GWebmaster2");
