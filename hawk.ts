import { indexNow } from "./lib/indexnow";
import { makeRobot, makeSitemap } from "./lib/utils";

export async function hawk(prettify: boolean = true): Promise<void> {
	const sitemapStatus: string = makeSitemap(prettify);
	const robotTxtStatus: string = makeRobot();
	console.log(sitemapStatus, " | ", robotTxtStatus);
	await indexNow();
}
hawk();
