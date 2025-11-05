import { hasValue } from '../../shared/empty.util';

/**
 * An interface to represent the path of a section error
 */
export interface SectionErrorPath {

  /**
   * The section id
   */
  sectionId: string;

  /**
   * The form field id
   */
  fieldId?: string;

  /**
   * The form field index
   */
  fieldIndex?: number;

  /**
   * The complete path
   */
  originalPath: string;
}

const regex = /([^\/]+)/g;
// const regex = /\/sections\/(.*)\/(.*)\/(.*)/;
const regexShort = /\/sections\/(.*)/;

/**
 * The following method accept an array of section path strings and return a path object
 * @param {string | string[]} path
 * @returns {SectionErrorPath[]}
 */
const parseSectionErrorPaths = (path: string | string[]): SectionErrorPath[] => {
  const paths = typeof path === 'string' ? [path] : path;

  console.log('🟡 parseSectionErrorPaths - Input path(s):', path);
  console.log('🟡 parseSectionErrorPaths - Processing paths array:', paths);

  const result = paths.map((item) => {
    console.log('🟡 Processing item:', item);
    // Reset regex index before matching
    regex.lastIndex = 0;
    const matches = item.match(regex);
    console.log('🟡 Regex matches:', matches);
    
    if (matches && matches.length > 2) {
      // Convert dots to underscores in fieldId to match form field IDs
      const originalFieldId = matches[2];
      const fieldId = originalFieldId.replace(/\./g, '_');
      console.log('🟡 Converting fieldId from', originalFieldId, 'to', fieldId);
      
      const parsed = {
        sectionId: matches[1],
        fieldId: fieldId,
        fieldIndex: hasValue(matches[3]) ? +matches[3] : 0,
        originalPath: item,
      };
      console.log('🟡 Parsed result:', parsed);
      return parsed;
    } else {
      // Reset regex index before matching
      regexShort.lastIndex = 0;
      const shortMatch = item.match(regexShort);
      console.log('🟡 Using short regex, match:', shortMatch);
      const parsed = {
        sectionId: shortMatch ? shortMatch[1] : item,
        originalPath: item,
      };
      console.log('🟡 Parsed result (short):', parsed);
      return parsed;
    }
  });

  console.log('🟡 parseSectionErrorPaths - Final result:', result);
  return result;
};

export default parseSectionErrorPaths;
