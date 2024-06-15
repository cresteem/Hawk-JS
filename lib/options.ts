export interface ConfigurationOptions {
	lookupPatterns: string[];
	ignorePattern: string[];
	timeZone: string;
	domainName: string;
	sitemapPath: string;
	robotPath: string;
	fallbacks: fallbackOptions;
}

interface fallbackOptions {
	changeFrequency: changeFrequencyTypes;
	priority: number;
}

type changeFrequencyTypes =
	| "always"
	| "hourly"
	| "daily"
	| "weekly"
	| "monthly"
	| "yearly"
	| "never";

export interface RouteMetaOptions {
	route: string;
	modifiedTime: string;
	changeFrequency: changeFrequencyTypes;
	priority: number;
}
