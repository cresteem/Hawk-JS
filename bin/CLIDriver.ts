#!/usr/bin/env node

import yargs from "yargs";
import { hawk, hawkStrategy } from "../hawk";
import { makeSitemap } from "../lib/utils";

async function _genMapHandler(argv: any): Promise<void> {
	if (argv.commit) {
		/* Make sitemap and update to Google search console */
		await hawkStrategy.gWebmaster2(
			argv.prettify,
			argv.include,
			argv.exclude,
		);
	} else {
		/* Only making site map */
		await makeSitemap(argv.prettify, argv.include, argv.exclude);
	}
}

async function _mainHandler(argv: any): Promise<void> {
	await hawk(argv.strategy, argv.include, argv.exclude, argv.prettify);
}

async function main(): Promise<void> {
	// Configure yargs options
	const argv = await yargs
		.scriptName("hawk")
		.usage("$0 [options] [args]")
		.option("strategy", {
			alias: "s",
			describe: "Strategy to use",
			choices: ["GIndex", "IndexNow", "GWebmaster", "GWebmaster2"],
			default: "IndexNow",
		})
		.option("include", {
			alias: "i",
			describe: "Include pattern",
			type: "array",
			default: [],
		})
		.option("exclude", {
			alias: "e",
			describe: "Exclude pattern",
			type: "array",
			default: [],
		})
		.option("prettify", {
			alias: "p",
			describe: "Prettify sitemap.xml output",
			type: "boolean",
			default: false,
		})
		.command(
			"genmap [option]",
			"Generate sitemap.xml & upload to Google search console.",
			(yargs) => {
				yargs.option("commit", {
					alias: "c",
					describe: "Upload to Google search console",
					type: "boolean",
					default: false,
				});
			},
		)
		.command("secret", "Set secret credentials")
		.strict()
		.help().argv;

	const isGenMap: boolean = argv._.includes("genmap");
	if (isGenMap) {
		_genMapHandler(argv);
	} else {
		_mainHandler(argv);
	}
}

main().catch((error) => {
	console.error("Error executing CLI:", error);
	process.exit(1);
});
