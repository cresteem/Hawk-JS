import { googleIndex } from "./lib/gindex";
import { indexNow } from "./lib/indexnow";
import {
	getLastRunTimeStamp,
	getUpdatedRoutesPath,
	makeRobot,
	makeSitemap,
} from "./lib/utils";

export async function hawk(
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

	/* For Bing, Yahoo, Yandex, Yep, etc */
	await indexNow(stateChangedRoutes);

	/* For Google - Web page which has JobPosting or Livestream Broadcasting content. */
	await googleIndex(stateChangedRoutes);
}

hawk();
