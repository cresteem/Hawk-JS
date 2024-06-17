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
}

export interface RouteMetaOptions {
	route: string;
	modifiedTime: string;
}

export interface ranStatusFileStructute {
	lastRunTimeStamp: number;
	secretKey: string;
}

interface constantsStructure {
	ranStatusFile: string;
}

export const constants: constantsStructure = {
	ranStatusFile: join(process.cwd(), ".hawk.lrs"),
};

interface responseBodyError {
	code: string;
	message: string;
	status: string;
}
interface responseBodyStructure {
	error: responseBodyError;
}
export type googleIndexStatusCode = 200 | 400 | 403 | 429;
export interface googleIndexResponseOptions {
	url: string;
	body: responseBodyStructure;
	statusCode: googleIndexStatusCode;
}
