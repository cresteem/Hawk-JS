import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
	{
		plugins: {
			"@typescript-eslint": typescriptEslint,
		},

		languageOptions: {
			parser: tsParser,
		},

		rules: {
			"@typescript-eslint/explicit-function-return-type": "error",
		},
		ignores: ["dist/**"],
	},
];
