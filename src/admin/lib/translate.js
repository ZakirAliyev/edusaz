import { translateText } from '@/services/translationService';
import { LANGUAGES } from './constants';

/**
 * Translates source fields into every supported language.
 * @param {Record<string,string>} fields  e.g. { name, description }
 * @param {(done:number,total:number)=>void} onProgress
 * @param {string} from  language code of `fields`
 * @returns {Promise<Record<string, Record<string,string>>>} translations keyed by language code
 */
export async function translateToAllLanguages(fields, onProgress, from = 'az') {
  const keys = Object.keys(fields);
  const result = { [from]: { ...fields } };
  const targets = LANGUAGES.filter((l) => l.code !== from);
  const total = LANGUAGES.length;
  let done = 1;
  onProgress?.(done, total);

  for (let i = 0; i < targets.length; i += 5) {
    const chunk = targets.slice(i, i + 5);
    await Promise.all(
      chunk.map(async ({ code }) => {
        const values = await Promise.all(
          keys.map((k) => (fields[k] ? translateText(fields[k], from, code) : Promise.resolve('')))
        );
        result[code] = Object.fromEntries(keys.map((k, idx) => [k, values[idx] || fields[k] || '']));
        done += 1;
      })
    );
    onProgress?.(done, total);
  }
  return result;
}

export const emptyTranslations = (seed = {}) =>
  Object.fromEntries(LANGUAGES.map((l) => [l.code, l.code === 'az' ? { ...seed } : {}]));
