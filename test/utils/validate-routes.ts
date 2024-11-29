import { utimesSync } from "node:fs";
import { type Hawk } from "../../lib/core";

export default function validateRoutes(
	testSampleRoot: string,
	hawkInstance: Hawk,
) {
	process.chdir(testSampleRoot);

	const { lookupPatterns, ignorePattern } = hawkInstance.configurations;

	const availableRoutes = hawkInstance.utils.lookupFiles(
		lookupPatterns,
		ignorePattern,
	);

	//change mod time of routes
	const simulatedLastSubmisssionTime = Date.now();
	const newRouteModTime = new Date(simulatedLastSubmisssionTime + 10); //simulate as 10ms latest

	//pick some random number of routes and update
	const simulated_updatedRoutes = availableRoutes
		.slice(0, _getRandomInteger(1, availableRoutes.length))
		.map((route) => {
			utimesSync(route, newRouteModTime, newRouteModTime);
			return route;
		});

	const updatedRoutes = hawkInstance.utils.getUpdatedRoutesPath(
		simulatedLastSubmisssionTime,
		lookupPatterns,
		ignorePattern,
	);

	return simulated_updatedRoutes.length === updatedRoutes.length;
}

function _getRandomInteger(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min; // Inclusive of both min and max
}
