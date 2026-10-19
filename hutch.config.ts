// @hutch cli=0.28.1 cottontail=0.7.2
export default {
	scripts: {
		start: ["hutch", "electrobun", "dev"],
		dev: ["hutch", "electrobun", "dev", "--watch"],
		build: ["hutch", "electrobun", "build"],
	},
	electrobun: {
		version: "2.0.4",
	},
};
