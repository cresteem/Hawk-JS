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
	/* Private property */
	ftpCredential: ftpCredentialOptions;
	serviceAccountFile: string;
}

export interface RouteMeta {
	route: string;
	modifiedTime: string;
}

export interface LastStateType {
	lastRunTimeStamp: number;
	secretKey: string;
	submittedSitemap: string;
}

export interface RanStatusFileStructure {
	lastRunTimeStamp: number;
	secretKey: string;
	submittedSitemap: string;
}

interface constantsStructure {
	ranStatusFile: string;
}

export const constants: constantsStructure = {
	ranStatusFile: join(process.cwd(), ".hawk.lrs"),
};

interface ResponseBodyError {
	code: string;
	message: string;
	status: string;
}

interface ResponseBodyStructure {
	error: ResponseBodyError;
}

export type GoogleIndexStatusCode = 200 | 400 | 403 | 429 | 204;

export interface GoogleIndexResponseOptions {
	url: string;
	body: ResponseBodyStructure;
	statusCode: GoogleIndexStatusCode;
}

export interface SitemapMeta {
	pageCounts: number;
	lastSubmitted: string;
	lastDownloaded: string;
	isPending: boolean;
	warnings: number;
	errors: number;
}

export type SuppotredStrategies =
	| "GIndex" /* Google Indexing API - Only for job posting & live broadcasting video content page*/
	| "GWebmaster" /* General web sitemap submission */
	| "GWebmaster2" /* General web sitemap submission with status check-back */
	| "IndexNow"; /* Index now api only for Bing, Yahoo, Yandex, Yep etc */

export interface SecretObjectType {
	host: string;
	user: string;
	pass: string;
}

export interface IndexNowPayload {
	host: string;
	key: string;
	keyLocation: string;
	urlList: string[];
}

export interface GoogleJobMediaIndexingPayload {
	url: string;
	type: "URL_UPDATED";
}
