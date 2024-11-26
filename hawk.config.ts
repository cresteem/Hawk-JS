import { ConfigurationOptions } from "./lib/types";

const config: ConfigurationOptions = {
	lookupPatterns: ["**/*.html", "**/*.htm"],
	ignorePattern: ["node_modules/**"],
	timeZone: "Asia/Kolkata",
	domainName: "www.cresteem.com",
	sitemapPath: "sitemap.xml",
	robotPath: "robot.txt",
	serviceAccountFile: "gserv.json",
	ftpCredential: {} as any,
};

export default config;
