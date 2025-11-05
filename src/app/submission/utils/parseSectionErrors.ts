import { SubmissionObjectError } from '../../core/submission/models/submission-object.model';
import {
  default as parseSectionErrorPaths,
  SectionErrorPath,
} from './parseSectionErrorPaths';

/**
 * the following method accept an array of SubmissionObjectError and return a section errors object
 * @param {errors: SubmissionObjectError[]} errors
 * @returns {any}
 */
const parseSectionErrors = (errors: SubmissionObjectError[] = []): any => {
  const errorsList = Object.create({});

  console.log('🔴 parseSectionErrors - Received errors from backend:', errors);

  errors.forEach((error: SubmissionObjectError) => {
    console.log('🔴 Processing error:', error.message, 'with paths:', error.paths);
    const paths: SectionErrorPath[] = parseSectionErrorPaths(error.paths);
    console.log('🔴 Parsed paths:', paths);

    paths.forEach((path: SectionErrorPath) => {
      const sectionError = { path: path.originalPath, message: error.message };
      console.log('🔴 Creating section error for section:', path.sectionId, 'with path:', path.originalPath);
      if (!errorsList[path.sectionId]) {
        errorsList[path.sectionId] = [];
      }
      errorsList[path.sectionId].push(sectionError);
    });
  });

  console.log('🔴 Final errorsList:', errorsList);
  return errorsList;
};

export default parseSectionErrors;
