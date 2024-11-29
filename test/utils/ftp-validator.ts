import { Client as FTP } from "basic-ftp";
import { relative } from "path";
import { cwd } from "process";
import { type Hawk } from "../../lib/core";

export default function ftpValidator(
	hawkInstance: Hawk,
): Promise<boolean> {
	return new Promise(async (resolve, reject) => {
		//check if secretfile and sitemap available
		const secretfile = relative(
			cwd(),
			`${hawkInstance.utils.lastStateReader("secretKey")}.txt`,
		);
		const sitemap = relative(
			cwd(),
			hawkInstance.configurations.sitemapPath,
		);

		try {
			const ftp: FTP = new FTP();

			const {
				ftpCredential: { username, password, hostname },
			} = hawkInstance.configurations;

			await ftp.access({
				user: username,
				password: password,
				host: hostname,
			});

			const secretfileMeta = (await ftp.list(secretfile))[0];
			const sitemapMeta = (await ftp.list(sitemap))[0];

			ftp.close();
			resolve(secretfileMeta ? !!sitemapMeta : false);
		} catch (err) {
			reject(err);
		}
	});
}
