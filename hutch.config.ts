// @hutch cli=0.29.0 cottontail=0.7.3
export default {
	scripts: {
		start: ["hutch", "electrobun", "dev"],
		dev: ["hutch", "electrobun", "dev", "--watch"],
		build: ["hutch", "electrobun", "build"],
	},
	electrobun: {
		version: "2.0.6",
	},
};
