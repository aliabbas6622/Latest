import * as XLSX from 'xlsx';
import { MCQ, Option } from '../types';

// Helper to convert Google Drive share links to direct view links
export const convertGoogleDriveLink = (url: string): string => {
  if (!url) return '';
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
  const headers = ['Question'];
  if (config.includeImages) headers.push('Image URL (Optional)');
  headers.push('Subject Name', 'Topic Name', 'Topic ID (REQUIRED)');
  headers.push('Option A', 'Option B', 'Option C', 'Option D', 'Correct Option (A/B/C/D)', 'Explanation');
  if (config.includeExplanationImages) headers.push('Explanation Image URL (Optional)');

  const ws = XLSX.utils.aoa_to_sheet([headers]);

  // Basic widths
  ws['!cols'] = [{ wch: 50 }, { wch: 30 }, { wch: 20 }, { wch: 25 }, { wch: 40 }];

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

export const validateAndTransformExcelData = (
  data: any[],
  validTopicIds: Set<string>
): { valid: Omit<MCQ, 'id' | 'created_at'>[], errors: ExcelValidationError[] } => {
  const validQuestions: Omit<MCQ, 'id' | 'created_at'>[] = [];
  const errors: ExcelValidationError[] = [];

  data.forEach((row, index) => {
    const rowIndex = index + 2;

    // Check required fields
    if (!row['Question'] || !row['Option A'] || !row['Option B'] || !row['Explanation']) {
      errors.push({ row: rowIndex, message: 'Missing core content fields (Question, Options, Explanation)', type: 'error' });
      return;
    }

    // STRICT Topic ID Check
    const topicId = row['Topic ID (REQUIRED)']?.toString().trim();
    if (!topicId) {
      errors.push({ row: rowIndex, message: 'Topic ID is missing. Every row MUST have a valid Topic ID.', type: 'error' });
      return;
    }

    if (!validTopicIds.has(topicId)) {
      errors.push({ row: rowIndex, message: `Invalid Topic ID: '${topicId}'. Use the "Export Curriculum" tool to find valid IDs.`, type: 'error' });
      return;
    }

    // Validate Correct Option
    const correctOpt = (row['Correct Option (A/B/C/D)'] || '').toString().toUpperCase().trim();
    if (!['A', 'B', 'C', 'D'].includes(correctOpt)) {
      errors.push({ row: rowIndex, message: 'Correct Option must be A, B, C, or D', type: 'error' });
      return;
    }

    const subject = row['Subject Name']?.toString().trim() || 'Imported';
    const topic = row['Topic Name']?.toString().trim() || 'Imported';

    // Process Images
    const imageUrl = convertGoogleDriveLink(row['Image URL (Optional)'] || '');
    const explanationImageUrl = convertGoogleDriveLink(row['Explanation Image URL (Optional)'] || '');

    // Build Options
    const options: Option[] = [];
    if (row['Option A']) options.push({ id: crypto.randomUUID(), text: row['Option A'].toString(), is_correct: correctOpt === 'A' });
    if (row['Option B']) options.push({ id: crypto.randomUUID(), text: row['Option B'].toString(), is_correct: correctOpt === 'B' });
    if (row['Option C']) options.push({ id: crypto.randomUUID(), text: row['Option C'].toString(), is_correct: correctOpt === 'C' });
    if (row['Option D']) options.push({ id: crypto.randomUUID(), text: row['Option D'].toString(), is_correct: correctOpt === 'D' });

    validQuestions.push({
      question: row['Question'].toString(),
      subject: subject,
      topic: topic,
      topicId: topicId,
      explanation: row['Explanation'].toString(),
      options: options,
      image_url: imageUrl || undefined,
      explanation_image_url: explanationImageUrl || undefined
    });
  });

  return { valid: validQuestions, errors };
};