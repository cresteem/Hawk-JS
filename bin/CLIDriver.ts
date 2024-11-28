#!/usr/bin/env node

import { Command } from "commander";
import { Hawk } from "../lib/core";
import { SuppotredStrategies } from "../lib/types";
import iconAssociator from "./iconAssociator";
import initConfig from "./initConfig";

const program = new Command();
const hawkInstance = new Hawk();

const strategyOptions =
	"Strategy to use \n1.Index-Now\n2.G-Webmaster\n3.G-Webmaster2\n4.G-Index";

async function handleGenMap(options: Record<string, any>) {
	console.log(
		"🕸️  Making sitemap",
		options.commit ? "and uploading..." : "",
	);

	await hawkInstance.utils.makeSitemap(
		options.include,
		options.exclude,
		options.prettify,
		options.commit,
	);
}

async function handleMain(options: Record<string, any>) {
	if (
		!Boolean(options.strategy) ||
		!["1", "2", "3", "4"].includes(options.strategy)
	) {
		console.log(
			"⭕ Must Choose any one number from below\n",
			strategyOptions,
		);
		process.exit(1);
	}

	const strategyMap: Record<string, SuppotredStrategies> = {
		"1": "IndexNow",
		"2": "GWebmaster",
		"3": "GWebmaster2",
		"4": "GIndex",
	};

	await hawkInstance.hawk(
		strategyMap[options.strategy],
		options.include,
		options.exclude,
		options.prettify,
	);

	console.log(
		`🚀  Hawk employing "${strategyMap[options.strategy]}" strategy..`,
	);
}

async function main() {
	program
		.name("hawk")
		.description(
			"CLI for generating sitemaps and feeding to search engines",
		)
		.version("1.5.0");

	// Global options
	program
		.option("-s, --strategy <number>", strategyOptions)
		.option(
			"-i, --include <patterns...>",
			"Include patterns",
			hawkInstance.configurations.lookupPatterns,
		)
		.option(
			"-e, --exclude <patterns...>",
			"Exclude patterns",
			hawkInstance.configurations.ignorePattern,
		)
		.option("-p, --prettify", "Prettify sitemap.xml output", false);

	// Genmap command
	program
		.command("genmap")
		.option("-c, --commit", "Upload to FTP Server", false)
		.description(
			"Generate sitemap.xml and optionally upload to FTP server",
		)
		.action(async (options) => {
			await handleGenMap({
				...program.opts(),
				...options,
			});
		});

	// 'init' command
	program
		.command("init")
		.description("Initialize Hawk.js configurations")
		.action(async () => {
			try {
				await iconAssociator();
				initConfig();
				console.log("🚀 Hawk.js configuration initialised.");
			} catch (err) {
				console.error("⚠️ Error initializing configurations", err);
				process.exit(1);
			}
		});

	// Default command (no subcommand provided)
	program.action(async () => {
		await handleMain(program.opts());
	});

	await program.parseAsync(process.argv);
}

main().catch((error) => {
	console.error("Error executing CLI:", error);
	process.exit(1);
});
