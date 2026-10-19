import type { ElectrobunConfig } from "electrobun";

export default {
	app: {
		name: "Postbird",
		identifier: "org.paxa.postbird",
		version: "0.8.4",
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
		},
		linux: {
			bundleCEF: false,
		},
		win: {
			bundleCEF: false,
		},
	},
} satisfies ElectrobunConfig;
