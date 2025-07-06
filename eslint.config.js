/** @type {import("eslint").Linter.Config} */
import { baseConfig } from '@estarlincito/eslint';

export default [...baseConfig, { ignores: ['dist', 'playground'] }];
// node src/scripts/build-content.ts
