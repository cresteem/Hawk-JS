import loadConfiguration from "../configLoader";
import GoogleIndexing from "./gindex";
import IndexNow from "./indexnow";
import type {
	ConfigurationOptions,
	SitemapMeta,
	SuppotredStrategies,
} from "./types";
import Utils from "./utils";

export class Hawk {
	configurations: ConfigurationOptions;
	utils: Utils;
	#googleIndex: GoogleIndexing;

	constructor() {
		this.configurations = loadConfiguration();
		this.utils = new Utils(this.configurations);
		this.#googleIndex = new GoogleIndexing(this);
	}

	async hawk(
		strategy: SuppotredStrategies,
		lookupPatterns: string[] = this.configurations.lookupPatterns,
		ignorePatterns: string[] = this.configurations.ignorePattern,
		prettify: boolean = false,
	): Promise<void> {
		const strategyLowercase: string = strategy.toLowerCase();

		try {
			if (["gwebmaster", "gwebmaster2"].includes(strategyLowercase)) {
				/* For all types of website*/
				await this.#_googleWebmaster(
					lookupPatterns,
					ignorePatterns,
					prettify,
					strategyLowercase === "gwebmaster2",
				);
			} else if (strategyLowercase === "indexnow") {
				const stateChangedRoutes: string[] = this.#_getstateChangedRoutes(
					lookupPatterns,
					ignorePatterns,
				);

				/* For Bing, Yahoo, Yandex, Yep, etc */
				await new IndexNow(this).trigger(stateChangedRoutes);
			} else if (strategyLowercase === "gindex") {
				const stateChangedRoutes: string[] = this.#_getstateChangedRoutes(
					lookupPatterns,
					ignorePatterns,
				);

				/* For Google - Web page which has JobPosting or Livestream Broadcasting content. */
				await this.#googleIndex.jobMediaIndex(stateChangedRoutes);
			}
		} catch (err) {
			console.log("Program stopping.. reason below ⬇️", "\n", err);
			process.exit(1);
		}
	}

	async #_googleWebmaster(
		lookupPatterns: string[] = [],
		ignorePattern: string[] = [],
		prettify: boolean = false,
		checkFeedback: boolean = false,
	): Promise<void> {
		await this.#_makeSitemapRobot(lookupPatterns, ignorePattern, prettify);

		await this.#googleIndex.webmasterIndex(); //submit sitmap.xml

		if (checkFeedback) {
			/* check status */
			const statusMeta: SitemapMeta =
				await this.#googleIndex.webmasterFeedback();
			console.log(statusMeta);
		}
	}

	async #_makeSitemapRobot(
		lookupPatterns: string[] = [],
		ignorePattern: string[] = [],
		prettify: boolean,
	) {
		const upload = true;

		/* Create sitemap.xml and robot.txt */
		const sitemapStatus: string = await this.utils.makeSitemap(
			lookupPatterns,
			ignorePattern,
			prettify,
			upload,
		);
		const robotTxtStatus: string = this.utils.makeRobot();
		console.log("\n" + sitemapStatus, " | ", robotTxtStatus);
	}

	#_getstateChangedRoutes(
		lookupPatterns: string[],
		ignorePatterns: string[],
	): string[] {
		const lastRunTimeStamp: number = this.utils.getLastRunTimeStamp();
		const stateChangedRoutes: string[] = this.utils.getUpdatedRoutesPath(
			lastRunTimeStamp,
			lookupPatterns,
			ignorePatterns,
		);

		return stateChangedRoutes;
	}
}

export type hawkJsOptions = ConfigurationOptions;
