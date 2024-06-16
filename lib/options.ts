import { join } from "path";

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
