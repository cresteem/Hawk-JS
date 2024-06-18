import { join } from "path";

export interface ftpCredentialOptions {
	hostname: string;
	username: string;
	password: string;
}

export interface ConfigurationOptions {
	lookupPatterns: string[];
	ignorePattern: string[];
	timeZone: string;
	domainName: string;
	sitemapPath: string;
	robotPath: string;
	secretFile: string;

	/* Private property */
	ftpCredential: ftpCredentialOptions;
}

export interface RouteMetaOptions {
	route: string;
	modifiedTime: string;
}

export type lastStateKeyNames =
	| "lastRunTimeStamp"
	| "secretKey"
	| "submittedSitemap";

export interface ranStatusFileStructute {
	lastRunTimeStamp: number;
	secretKey: string;
	submittedSitemap: string;
}

interface constantsStructure {
	ranStatusFile: string;
	serviceAccountFile: string;
}

export const constants: constantsStructure = {
	ranStatusFile: join(process.cwd(), ".hawk.lrs"),
	serviceAccountFile: join(process.cwd(), "gserv.json"),
};

interface responseBodyError {
	code: string;
	message: string;
	status: string;
}
interface responseBodyStructure {
	error: responseBodyError;
}
export type googleIndexStatusCode = 200 | 400 | 403 | 429 | 204;
export interface googleIndexResponseOptions {
	url: string;
	body: responseBodyStructure;
	statusCode: googleIndexStatusCode;
}

export interface sitemapMetaOptions {
	pageCounts: number;
	lastSubmitted: string;
	lastDownloaded: string;
	isPending: boolean;
	warnings: number;
	errors: number;
}

export type suppotredStrategies =
	| "GIndex" /* Google Indexing API - Only for job posting & live broadcasting video content page*/
	| "GWebmaster" /* General web sitemap submission */
	| "GWebmaster2" /* General web sitemap submission with status check-back */
	| "IndexNow"; /* Index now api only for Bing, Yahoo, Yandex, Yep etc */

export interface secretObjectStructure {
	host: string;
	user: string;
	pass: string;
}
