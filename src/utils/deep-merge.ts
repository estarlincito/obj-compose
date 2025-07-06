import type { JsonObject } from '@/types.js';

import { isPlainObject } from './plain-object.js';

export const deepMerge = (
  target: JsonObject,
  source: JsonObject,
): JsonObject => {
  const output: JsonObject = { ...target };

  for (const [key, sourceVal] of Object.entries(source)) {
    const targetVal = output[key];

    if (isPlainObject(targetVal) && isPlainObject(sourceVal)) {
      output[key] = deepMerge(targetVal, sourceVal);
    } else {
      output[key] = sourceVal;
    }
  }

  return output;
};
