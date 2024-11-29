import { ConfigurationOptions } from "./lib/types";

const config: ConfigurationOptions = {
	lookupPatterns: ["**/*.html", "**/*.htm"],
	ignorePattern: ["node_modules/**"],
	timeZone: "Asia/Kolkata",
	domainName: "www.cresteem.com",
	sitemapPath: "sitemap.xml",
	robotPath: "robot.txt",
	serviceAccountFile: "gserv.json",
	ftpCredential: {
		hostname: "localhost",
		username: "one",
		password: "1234",
	},
};

export default config;
