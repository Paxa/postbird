import type { ElectrobunConfig } from "electrobun";

export default {
	app: {
		name: "Postbird",
		identifier: "org.paxa.postbird",
		version: "0.9.1",
	},
	build: {
		mainProcess: "bun",
		bun: {
			entrypoint: "electrobun/main.ts",
		},
		views: {
			mainview: {
				entrypoint: "electrobun/view.ts",
			},
		},
		copy: {
			"index.html": "views/mainview/index.html",
			"public": "views/mainview/public",
			"vendor": "vendor",
		},
		mac: {
			bundleCEF: false,
			// Signing is opt-in via env so local and CI builds stay unsigned.
			// Only .github/workflows/release-postbird-direct.yml sets these.
			codesign: Boolean(process.env.ELECTROBUN_DEVELOPER_ID),
			notarize: Boolean(process.env.ELECTROBUN_APPLEAPIKEY),
		},
		linux: {
			bundleCEF: false,
			// Window and taskbar icon. Without it GNOME shows a generic one.
			icon: "build_files/icon.png",
		},
		win: {
			bundleCEF: false,
		},
	},
} satisfies ElectrobunConfig;
