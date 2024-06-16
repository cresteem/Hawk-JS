export interface ConfigurationOptions {
	lookupPatterns: string[];
	ignorePattern: string[];
	timeZone: string;
	domainName: string;
	sitemapPath: string;
	robotPath: string;
}

export interface RouteMetaOptions {
	route: string;
	modifiedTime: string;
}
