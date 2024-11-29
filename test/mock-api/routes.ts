import express from "express";
import {
	GoogleJobMediaIndexingPayload,
	IndexNowPayload,
} from "../../lib/types";
const router = express.Router();

//PUT
router.put(
	"/webmaster/*",
	function (req: any, res: any, _next: () => void) {
		try {
			let [hostname, _, sitemapUrl] = req.url.split("/").slice(-3);
			hostname = decodeURIComponent(hostname);
			sitemapUrl = decodeURIComponent(sitemapUrl);

			console.log("GoogleWebmaster -> Received Payload:", {
				hostname: hostname,
				sitemapUrl: sitemapUrl,
			});

			const isSameOrginMap = hostname
				? sitemapUrl
					? hostname.includes(new URL(sitemapUrl).hostname)
					: false
				: false;

			const authtoken = req.headers["authorization"];
			const validAuthToken = authtoken && authtoken.length > 150;

			if (validAuthToken && isSameOrginMap) {
				console.log("GoogleWebmaster -> ✅");
				res.status(200).json({ msg: "Success" });
			} else {
				console.log("GoogleWebmaster -> ❌");
				res.status(400).json({ msg: "Bad request" });
			}
		} catch (err) {
			console.log("GoogleWebmaster -> ❌");
			res.status(500).json({ msg: err });
		}
	},
);

//POST
router.post(
	"/google-jobmedia-indexing",
	function (req: any, res: any, _next: () => void) {
		try {
			const payload: GoogleJobMediaIndexingPayload = req.body;

			console.log("GoogleJMIndex -> Received Payload:", payload);

			const { url, type } = payload;

			const validPayload = url
				? new URL(url)?.hostname
					? type
						? true
						: false
					: false
				: false;

			const validType = type === "URL_UPDATED";

			const authtoken = req.headers["authorization"];
			const validAuthToken = authtoken && authtoken.length > 150;

			if (validPayload && validType && validAuthToken) {
				console.log("GoogleJMIndex -> ✅");
				res.status(200).json({ msg: "Good request" });
			} else {
				console.log("GoogleJMIndex -> ❌");
				res.status(400).json({ msg: "Required field missing" });
			}
		} catch (err) {
			console.log("GoogleJMIndex -> ❌");
			res.status(500).json({ error: err });
		}
	},
);

//POST
router.post("/indexnow", function (req: any, res: any, _next: () => void) {
	try {
		const payload: IndexNowPayload = req.body;

		console.log("Indexnow -> Received Payload:", payload);

		const { host, key, keyLocation, urlList } = payload;

		const isNotFound: string | false = !host
			? "Host"
			: !key
			? "Key"
			: !keyLocation
			? "Key location"
			: !urlList
			? "Urlist"
			: false;

		const keyIsValid = key.length >= 32;

		const keyLocationIsValid =
			(new URL(keyLocation).pathname || false) && //check if its valid url and has path
			keyLocation.includes(key) && //check if key and keyfilename are same
			keyLocation.includes(host); // check if host intersect with keylocation

		const allUrlsAreValid = Array.isArray(urlList) //check if urlist is valid array
			? urlList.every((url) => new URL(url).hostname || false) //check if all given url are valid
			: false;

		if (
			!isNotFound &&
			keyIsValid &&
			keyLocationIsValid &&
			allUrlsAreValid
		) {
			console.log("Indexnow -> ✅");
			res.status(200).json({ msg: "Good request" });
		} else {
			console.log("Indexnow -> ❌");
			res.status(400).json({
				msg: `${isNotFound} field missing or urlList must be array or failed at validation`,
			});
		}
	} catch (err) {
		console.log("Indexnow -> ❌");
		res.status(500).json({ error: err });
	}
});

export default router;
