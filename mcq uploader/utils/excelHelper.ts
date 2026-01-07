import * as XLSX from 'xlsx';
import { MCQ, Option } from '../types';
import { SUBJECTS } from '../constants';

// Helper to convert Google Drive share links to direct view links
export const convertGoogleDriveLink = (url: string): string => {
  if (!url) return '';

  // Check for standard drive file link: https://drive.google.com/file/d/FILE_ID/view
  const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileIdMatch && fileIdMatch[1]) {
    return `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
  }

  return url;
};

export interface TemplateConfig {
  includeImages: boolean;
  includeExplanationImages: boolean;
  includeSubtopics: boolean;
}

export const generateTemplate = (config: TemplateConfig = { includeImages: true, includeExplanationImages: true, includeSubtopics: true }) => {
  // Build Dynamic Headers
  const headers = ['Question'];
  if (config.includeImages) headers.push('Image URL (Optional)');
  headers.push('Subject');
  if (config.includeSubtopics) headers.push('Topic');
  headers.push('Option A', 'Option B', 'Option C', 'Option D', 'Correct Option (A/B/C/D)', 'Explanation');
  if (config.includeExplanationImages) headers.push('Explanation Image URL (Optional)');

  const ws = XLSX.utils.aoa_to_sheet([headers]);

  // Dynamic Column Widths
  const colWidths: any[] = [{ wch: 50 }]; // Question
  if (config.includeImages) colWidths.push({ wch: 30 }); // Image URL
  colWidths.push({ wch: 20 }); // Subject
  if (config.includeSubtopics) colWidths.push({ wch: 25 }); // Topic
  colWidths.push(
    { wch: 20 }, // Option A
    { wch: 20 }, // Option B
    { wch: 20 }, // Option C
    { wch: 20 }, // Option D
    { wch: 25 }, // Correct Option
    { wch: 50 }  // Explanation
  );
  if (config.includeExplanationImages) colWidths.push({ wch: 30 });

  ws['!cols'] = colWidths;

  // Calculate Column Addresses for Data Validation
  // Helpers to get column letters (A, B, C...)
  const getColLetter = (index: number) => String.fromCharCode(65 + index);

  let currentIdx = 0;
  // Skip Question (0)
  currentIdx++;

  let imgColIdx = -1;
  if (config.includeImages) {
    imgColIdx = currentIdx;
    currentIdx++;
  }

  const subjectColIdx = currentIdx;
  currentIdx++;

  let topicColIdx = -1;
  if (config.includeSubtopics) {
    topicColIdx = currentIdx;
    currentIdx++;
  }

  // Options A-D (currentIdx + 0 to 3)
  currentIdx += 4;

  const correctOptColIdx = currentIdx;
  currentIdx++;

  // Prepare lists for Data Validation
  const subjectsList = `"${SUBJECTS.map(s => s.value).join(',')}"`;
  const topicsList = `"${SUBJECTS.flatMap(s => s.topics).join(',')}"`;

  // Add Data Validation
  const dataValidation: any[] = [
    {
      sqref: `${getColLetter(subjectColIdx)}2:${getColLetter(subjectColIdx)}1000`,
      type: 'list',
      operator: 'equal',
      formula1: subjectsList,
      showErrorMessage: true,
      errorTitle: "Invalid Subject",
      error: "Please select a valid subject from the list."
    },
    {
      sqref: `${getColLetter(correctOptColIdx)}2:${getColLetter(correctOptColIdx)}1000`,
      type: 'list',
      operator: 'equal',
      formula1: '"A,B,C,D"',
      showErrorMessage: true,
      errorTitle: "Invalid Option",
      error: "Value must be A, B, C, or D"
    }
  ];

  if (config.includeSubtopics && topicColIdx !== -1) {
    dataValidation.push({
      sqref: `${getColLetter(topicColIdx)}2:${getColLetter(topicColIdx)}1000`,
      type: 'list',
      operator: 'equal',
      formula1: topicsList,
      showErrorMessage: true,
      errorTitle: "Invalid Topic",
      error: "Please select a valid topic from the list."
    });
  }

  ws['!dataValidation'] = dataValidation;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  XLSX.writeFile(wb, "Aptivo_MCQ_Template.xlsx");
};

export const parseExcelFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};

export interface ExcelValidationError {
  row: number;
  message: string;
  type: 'error' | 'warning';
}

// Levenshtein distance for fuzzy matching
const getLevenshteinDistance = (a: string, b: string): number => {
  const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
};

const findBestTopicMatch = (input: string, validTopics: string[]): { match: string, isFuzzy: boolean } | null => {
  if (!input) return null;
  const normalizedInput = input.trim().toLowerCase();

  // 1. Exact match (case-insensitive)
  const exactMatch = validTopics.find(t => t.toLowerCase() === normalizedInput);
  if (exactMatch) return { match: exactMatch, isFuzzy: false };

  // 2. Partial match (contains)
  const contentMatches = validTopics.filter(t => normalizedInput.includes(t.toLowerCase()));
  if (contentMatches.length > 0) {
    return {
      match: contentMatches.sort((a, b) => b.length - a.length)[0],
      isFuzzy: true
    };
  }

  // 3. Fuzzy match (Levenshtein)
  let bestMatch = null;
  let minDistance = Infinity;

  for (const topic of validTopics) {
    const dist = getLevenshteinDistance(normalizedInput, topic.toLowerCase());
    let threshold = 1;
    if (topic.length >= 5) threshold = 2;
    if (topic.length > 8) threshold = 3;

    if (dist <= threshold && dist < minDistance) {
      minDistance = dist;
      bestMatch = topic;
    }
  }

  if (bestMatch) return { match: bestMatch, isFuzzy: true };
  return null;
};

export const validateAndTransformExcelData = (data: any[]): { valid: Omit<MCQ, 'id' | 'created_at'>[], errors: ExcelValidationError[] } => {
  const validQuestions: Omit<MCQ, 'id' | 'created_at'>[] = [];
  const errors: ExcelValidationError[] = [];

  const validSubjects = SUBJECTS.map(s => s.value);
  const validTopics = SUBJECTS.flatMap(s => s.topics);

  data.forEach((row, index) => {
    const rowIndex = index + 2;

    // Check required fields
    if (!row['Question'] || !row['Option A'] || !row['Option B'] || !row['Explanation']) {
      errors.push({ row: rowIndex, message: 'Missing required fields (Question, Options A/B, Explanation)', type: 'error' });
      return;
    }

    // Validate Correct Option
    const correctOpt = (row['Correct Option (A/B/C/D)'] || '').toString().toUpperCase().trim();
    if (!['A', 'B', 'C', 'D'].includes(correctOpt)) {
      errors.push({ row: rowIndex, message: 'Correct Option must be A, B, C, or D', type: 'error' });
      return;
    }

    // Validate Subject
    let subject = row['Subject'] ? row['Subject'].toString().trim() : 'General Knowledge';
    const matchedSubject = validSubjects.find(s => s.toLowerCase() === subject.toLowerCase());
    if (row['Subject'] && !matchedSubject) {
      errors.push({ row: rowIndex, message: `Invalid Subject: '${subject}'. Check valid list.`, type: 'error' });
      return;
    }
    subject = matchedSubject || subject;

    // Validate Topic with Robust Matching
    let topicInput = row['Topic'] ? row['Topic'].toString() : '';
    let topic = 'General';

    if (topicInput) {
      const result = findBestTopicMatch(topicInput, validTopics);
      if (result) {
        topic = result.match;
        if (result.isFuzzy) {
          errors.push({
            row: rowIndex,
            message: `Topic '${topicInput}' auto-corrected to '${topic}'`,
            type: 'warning'
          });
        }
      } else {
        errors.push({ row: rowIndex, message: `Invalid Topic: '${topicInput}'. Could not match to any known topic.`, type: 'error' });
        return;
      }
    }

    // Process Images
    const imageUrl = convertGoogleDriveLink(row['Image URL (Optional)'] || '');
    const explanationImageUrl = convertGoogleDriveLink(row['Explanation Image URL (Optional)'] || '');

    // Build Options
    const options: Option[] = [];
    if (row['Option A']) options.push({ id: crypto.randomUUID(), text: row['Option A'], is_correct: correctOpt === 'A' });
    if (row['Option B']) options.push({ id: crypto.randomUUID(), text: row['Option B'], is_correct: correctOpt === 'B' });
    if (row['Option C']) options.push({ id: crypto.randomUUID(), text: row['Option C'], is_correct: correctOpt === 'C' });
    if (row['Option D']) options.push({ id: crypto.randomUUID(), text: row['Option D'], is_correct: correctOpt === 'D' });

    validQuestions.push({
      question: row['Question'],
      subject: subject,
      topic: topic,
      explanation: row['Explanation'],
      options: options,
      image_url: imageUrl || undefined,
      explanation_image_url: explanationImageUrl || undefined
    });
  });

  return { valid: validQuestions, errors };
};