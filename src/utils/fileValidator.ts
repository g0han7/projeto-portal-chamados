// File validation utilities to prevent corrupted files from breaking the build

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface FileValidationOptions {
  checkSyntax?: boolean;
  checkImports?: boolean;
  checkExports?: boolean;
  allowedExtensions?: string[];
}

/**
 * Validates if a file contains valid TypeScript/JSX content
 */
export function validateTSXFile(content: string, filename: string): FileValidationResult {
  const result: FileValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Check if content is empty
  if (!content.trim()) {
    result.errors.push('File is empty');
    result.isValid = false;
    return result;
  }

  // Check if content looks like JSON error response
  if (content.trim().startsWith('{') && content.includes('"code"') && content.includes('"message"')) {
    result.errors.push('File contains JSON error response instead of code');
    result.isValid = false;
    return result;
  }

  // Check for common syntax issues
  const lines = content.split('\n');
  
  // Check for missing imports in React components
  if (content.includes('React.') || content.includes('<') || content.includes('useState') || content.includes('useEffect')) {
    if (!content.includes('import React') && !content.includes('import { ')) {
      result.warnings.push('React component may be missing React import');
    }
  }

  // Check for unmatched brackets
  const openBrackets = (content.match(/\{/g) || []).length;
  const closeBrackets = (content.match(/\}/g) || []).length;
  if (openBrackets !== closeBrackets) {
    result.errors.push(`Unmatched brackets: ${openBrackets} opening, ${closeBrackets} closing`);
    result.isValid = false;
  }

  // Check for unmatched parentheses
  const openParens = (content.match(/\(/g) || []).length;
  const closeParens = (content.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    result.errors.push(`Unmatched parentheses: ${openParens} opening, ${closeParens} closing`);
    result.isValid = false;
  }

  // Check for basic TypeScript/JSX structure
  if (filename.endsWith('.tsx') || filename.endsWith('.jsx')) {
    if (!content.includes('export') && !content.includes('function') && !content.includes('const') && !content.includes('class')) {
      result.warnings.push('File may not contain valid component definition');
    }
  }

  // Check for common error patterns
  const errorPatterns = [
    /Error:/,
    /SyntaxError:/,
    /TypeError:/,
    /ReferenceError:/,
    /"error":\s*true/,
    /"status":\s*"error"/,
    /Failed to/,
    /Cannot read property/,
    /is not defined/
  ];

  errorPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      result.errors.push('File contains error messages or stack traces');
      result.isValid = false;
    }
  });

  return result;
}

/**
 * Validates file extension
 */
export function validateFileExtension(filename: string, allowedExtensions: string[]): boolean {
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? allowedExtensions.includes(extension) : false;
}

/**
 * Sanitizes file content to remove potential corruption
 */
export function sanitizeFileContent(content: string): string {
  // Remove null bytes and other control characters
  let sanitized = content.replace(/\0/g, '');
  
  // Remove BOM if present
  if (sanitized.charCodeAt(0) === 0xFEFF) {
    sanitized = sanitized.slice(1);
  }
  
  // Normalize line endings
  sanitized = sanitized.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  return sanitized;
}

/**
 * Checks if content appears to be a valid React component
 */
export function isValidReactComponent(content: string): boolean {
  const validation = validateTSXFile(content, 'component.tsx');
  
  if (!validation.isValid) {
    return false;
  }
  
  // Additional React-specific checks
  const hasExport = /export\s+(default\s+)?/.test(content);
  const hasFunction = /function\s+\w+|const\s+\w+\s*=|class\s+\w+/.test(content);
  const hasJSX = /<[A-Z]/.test(content) || /<[a-z]/.test(content);
  
  return hasExport && hasFunction;
}

/**
 * Generates a basic React component template
 */
export function generateComponentTemplate(componentName: string): string {
  return `import React from 'react';

interface ${componentName}Props {
  // Add props here
}

const ${componentName}: React.FC<${componentName}Props> = (props) => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">${componentName}</h1>
      <p>Component content goes here</p>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Auto-fixes common file issues
 */
export function autoFixFile(content: string, filename: string): string {
  let fixed = sanitizeFileContent(content);
  
  // If file contains JSON error, replace with component template
  if (fixed.trim().startsWith('{') && fixed.includes('"code"') && fixed.includes('"message"')) {
    const componentName = filename.split('/').pop()?.replace(/\.(tsx|jsx)$/, '') || 'Component';
    const pascalCaseName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
    return generateComponentTemplate(pascalCaseName);
  }
  
  return fixed;
}

export default {
  validateTSXFile,
  validateFileExtension,
  sanitizeFileContent,
  isValidReactComponent,
  generateComponentTemplate,
  autoFixFile
};