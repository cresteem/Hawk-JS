/** @type {import("@cresteem/hawk-js").hawkJsOptions} */
const config = {
	lookupPatterns: ["**/*.html", "**/*.htm"],
	ignorePattern: ["node_modules/**"],
	timeZone: "Asia/Kolkata",
	domainName: "www.cresteem.com",
	sitemapPath: "sitemap.xml",
	robotPath: "robot.txt",
	serviceAccountFile: "gserv.json",
	ftpCredential: { username: "", password: "", hostname: "" },
};

exports.default = config;
