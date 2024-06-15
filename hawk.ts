import { makeRobot, makeSitemap } from "./lib/utils";

export function hawk(prettify: boolean = true): void {
	const sitemapStatus: string = makeSitemap(prettify);
	const robotTxtStatus: string = makeRobot();
	console.log(sitemapStatus, "\n", robotTxtStatus);
}
