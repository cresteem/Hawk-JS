import { utimesSync } from "node:fs";
import { type Hawk } from "../../lib/core";

export default async function strategyValidator(
	hawkInstance: Hawk,
): Promise<boolean> {
	const { lookupPatterns, ignorePattern } = hawkInstance.configurations;
	const availableRoutes = hawkInstance.utils.lookupFiles(
		lookupPatterns,
		ignorePattern,
	);

	//update one mtime
	let newtime = new Date(
		hawkInstance.utils.getLastRunTimeStamp() + 600000,
	);
	utimesSync(availableRoutes[0], newtime, newtime);
	const gIndex = await hawkInstance.hawk("GIndex");

	//update one mtime
	newtime = new Date(hawkInstance.utils.getLastRunTimeStamp() + 600000);
	utimesSync(availableRoutes[1], newtime, newtime);
	const indexNow = await hawkInstance.hawk("IndexNow");

	const gWebmaster = await hawkInstance.hawk("GWebmaster");

	return [gIndex, gWebmaster, indexNow].every((resolvedPromise, idx) => {
		if (!resolvedPromise) console.log("Failed Strategy index:", idx);
		return resolvedPromise;
	});
}
