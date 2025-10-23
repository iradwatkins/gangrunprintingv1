/**
 * Advanced File Validator
 * 
 * Enhanced security validation including magic byte verification,
 * virus scanning integration, and advanced threat detection
 */

import { ValidationResult } from './file-validator';
import { logger } from '@/lib/logger-safe';

// Magic byte signatures for file type verification
const FILE_SIGNATURES = {
  // PDF
  'application/pdf': [
    [0x25, 0x50, 0x44, 0x46], // %PDF
  ],
  
  // JPEG
  'image/jpeg': [
    [0xFF, 0xD8, 0xFF, 0xE0], // JFIF
    [0xFF, 0xD8, 0xFF, 0xE1], // EXIF
    [0xFF, 0xD8, 0xFF, 0xDB], // JPEG
  ],
  
  // PNG
  'image/png': [
    [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], // PNG signature
  ],
  
  // SVG (XML-based, check for SVG tag)
  'image/svg+xml': [
    // SVG files are XML, we'll check for content patterns instead
  ],
  
  // WebP
  'image/webp': [
    [0x52, 0x49, 0x46, 0x46], // RIFF (at start, followed by size, then WEBP)
  ],
  
  // PostScript/AI/EPS
  'application/postscript': [
    [0x25, 0x21, 0x50, 0x53], // %!PS
  ],
  
  // PSD
  'application/x-photoshop': [
    [0x38, 0x42, 0x50, 0x53], // 8BPS
  ],
} as const;

// Suspicious patterns that might indicate malicious content
const SUSPICIOUS_PATTERNS = [
  // Script tags
  /<script[^>]*>/i,
  /<\/script>/i,
  
  // JavaScript events
  /on\w+\s*=/i,
  
  // PHP tags
  /<\?php/i,
  /\?>/,
  
  // ASP tags
  /<%.*%>/,
  
  // Executable patterns
  /\x4D\x5A/, // MZ header (Windows PE)
  /\x7F\x45\x4C\x46/, // ELF header (Linux)
  
  // Embedded scripts
  /javascript:/i,
  /vbscript:/i,
];

// Maximum file content to scan for patterns (first 64KB)
const MAX_CONTENT_SCAN_SIZE = 64 * 1024;

export interface AdvancedValidationResult extends ValidationResult {
  threatLevel?: 'low' | 'medium' | 'high';
  warnings?: string[];
  scanResults?: {
    magicByteValid: boolean;
    suspiciousPatterns: string[];
    virusScanStatus?: 'clean' | 'infected' | 'scan_failed';
  };
}

/**
 * Validate file magic bytes against expected signatures
 */
export function validateMagicBytes(
  buffer: ArrayBuffer, 
  expectedMimeType: string
): { valid: boolean; actualType?: string; error?: string } {
  const uint8Array = new Uint8Array(buffer);
  const signatures = FILE_SIGNATURES[expectedMimeType as keyof typeof FILE_SIGNATURES];
  
  if (!signatures) {
    return { valid: true }; // No signature validation for this type
  }
  
  // Special handling for SVG (XML-based)
  if (expectedMimeType === 'image/svg+xml') {
    const text = new TextDecoder().decode(uint8Array.slice(0, 1024));
    const isSvg = text.includes('<svg') || text.includes('<?xml');
    return { 
      valid: isSvg, 
      error: isSvg ? undefined : 'File does not contain valid SVG content' 
    };
  }
  
  // Special handling for WebP
  if (expectedMimeType === 'image/webp') {
    const hasRiff = uint8Array.slice(0, 4).every((byte, i) => byte === [0x52, 0x49, 0x46, 0x46][i]);
    const hasWebp = uint8Array.slice(8, 12).every((byte, i) => byte === [0x57, 0x45, 0x42, 0x50][i]);
    return { 
      valid: hasRiff && hasWebp, 
      error: hasRiff && hasWebp ? undefined : 'File does not contain valid WebP signature' 
    };
  }
  
  // Check each signature for the MIME type
  for (const signature of signatures) {
    const matches = signature.every((expectedByte, index) => {
      return index < uint8Array.length && uint8Array[index] === expectedByte;
    });
    
    if (matches) {
      return { valid: true };
    }
  }
  
  return { 
    valid: false, 
    error: `File signature does not match expected ${expectedMimeType} format` 
  };
}

/**
 * Scan file content for suspicious patterns
 */
export function scanForSuspiciousPatterns(buffer: ArrayBuffer): {
  suspiciousPatterns: string[];
  threatLevel: 'low' | 'medium' | 'high';
} {
  const scanSize = Math.min(buffer.byteLength, MAX_CONTENT_SCAN_SIZE);
  const uint8Array = new Uint8Array(buffer, 0, scanSize);
  const text = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array);
  
  const foundPatterns: string[] = [];
  
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern instanceof RegExp) {
      if (pattern.test(text)) {
        foundPatterns.push(pattern.source);
      }
    }
  }
  
  // Check for binary patterns
  for (let i = 0; i < uint8Array.length - 4; i++) {
    // Check for MZ header (Windows PE)
    if (uint8Array[i] === 0x4D && uint8Array[i + 1] === 0x5A) {
      foundPatterns.push('Windows PE executable signature');
    }
    
    // Check for ELF header (Linux executable)
    if (uint8Array[i] === 0x7F && uint8Array[i + 1] === 0x45 && 
        uint8Array[i + 2] === 0x4C && uint8Array[i + 3] === 0x46) {
      foundPatterns.push('Linux ELF executable signature');
    }
  }
  
  // Determine threat level
  let threatLevel: 'low' | 'medium' | 'high' = 'low';
  
  if (foundPatterns.length > 0) {
    const executablePatterns = foundPatterns.filter(p => 
      p.includes('executable') || p.includes('script')
    );
    
    if (executablePatterns.length > 0) {
      threatLevel = 'high';
    } else if (foundPatterns.length > 2) {
      threatLevel = 'medium';
    } else {
      threatLevel = 'medium';
    }
  }
  
  return { suspiciousPatterns: foundPatterns, threatLevel };
}

/**
 * Enhanced virus scanning (placeholder for integration with ClamAV or similar)
 */
export async function performVirusScan(
  buffer: ArrayBuffer, 
  filename: string
): Promise<{ status: 'clean' | 'infected' | 'scan_failed'; details?: string }> {
  try {
    // TODO: Integrate with actual virus scanning service
    // For now, perform basic checks
    
    // Check file size (viruses are often small)
    if (buffer.byteLength < 100) {
      return { status: 'scan_failed', details: 'File too small to scan reliably' };
    }
    
    // Perform pattern scanning
    const patternScan = scanForSuspiciousPatterns(buffer);
    
    if (patternScan.threatLevel === 'high') {
      return { 
        status: 'infected', 
        details: `High threat level detected: ${patternScan.suspiciousPatterns.join(', ')}` 
      };
    }
    
    // Log scan attempt for monitoring
    logger.info('File virus scan completed', {
      filename,
      fileSize: buffer.byteLength,
      threatLevel: patternScan.threatLevel,
      patternsFound: patternScan.suspiciousPatterns.length,
    });
    
    return { status: 'clean' };
  } catch (error) {
    logger.error('Virus scan failed', {
      filename,
      error: error instanceof Error ? error.message : String(error),
    });
    
    return { status: 'scan_failed', details: 'Virus scan service unavailable' };
  }
}

/**
 * Comprehensive advanced file validation
 */
export async function validateFileAdvanced(
  filename: string,
  fileSize: number,
  mimeType: string,
  fileContent?: ArrayBuffer,
  orderId?: string
): Promise<AdvancedValidationResult> {
  try {
    // Start with basic validation
    const { validateFile } = await import('./file-validator');
    const basicResult = await validateFile(filename, fileSize, mimeType, orderId);
    
    if (!basicResult.valid) {
      return basicResult;
    }
    
    // If we don't have file content, return basic validation
    if (!fileContent) {
      return {
        ...basicResult,
        threatLevel: 'low',
        warnings: ['File content not available for advanced scanning'],
      };
    }
    
    const warnings: string[] = [];
    let threatLevel: 'low' | 'medium' | 'high' = 'low';
    
    // Validate magic bytes
    const magicByteResult = validateMagicBytes(fileContent, mimeType);
    if (!magicByteResult.valid) {
      warnings.push(magicByteResult.error || 'File signature validation failed');
      threatLevel = 'medium';
    }
    
    // Scan for suspicious patterns
    const patternScan = scanForSuspiciousPatterns(fileContent);
    if (patternScan.suspiciousPatterns.length > 0) {
      warnings.push(`Suspicious patterns detected: ${patternScan.suspiciousPatterns.join(', ')}`);
      threatLevel = patternScan.threatLevel;
    }
    
    // Perform virus scan
    const virusScan = await performVirusScan(fileContent, filename);
    if (virusScan.status === 'infected') {
      return {
        valid: false,
        error: `File failed security scan: ${virusScan.details}`,
        threatLevel: 'high',
      };
    }
    
    if (virusScan.status === 'scan_failed') {
      warnings.push(`Virus scan failed: ${virusScan.details}`);
    }
    
    // Determine final threat level
    if (threatLevel === 'high' || virusScan.status === 'infected') {
      threatLevel = 'high';
    } else if (warnings.length > 0) {
      threatLevel = Math.max(threatLevel as any, 'medium' as any) as 'medium';
    }
    
    const result: AdvancedValidationResult = {
      ...basicResult,
      threatLevel,
      warnings: warnings.length > 0 ? warnings : undefined,
      scanResults: {
        magicByteValid: magicByteResult.valid,
        suspiciousPatterns: patternScan.suspiciousPatterns,
        virusScanStatus: virusScan.status,
      },
    };
    
    // Log validation results
    logger.info('Advanced file validation completed', {
      filename,
      mimeType,
      fileSize,
      valid: result.valid,
      threatLevel: result.threatLevel,
      warningsCount: warnings.length,
      orderId,
    });
    
    return result;
  } catch (error) {
    logger.error('Advanced file validation failed', {
      filename,
      error: error instanceof Error ? error.message : String(error),
    });
    
    return {
      valid: false,
      error: 'Advanced validation failed - please try again',
      threatLevel: 'medium',
    };
  }
}

/**
 * Get security recommendations based on file type
 */
export function getSecurityRecommendations(mimeType: string): string[] {
  const recommendations: string[] = [];
  
  switch (mimeType) {
    case 'application/pdf':
      recommendations.push(
        'Ensure PDF does not contain JavaScript or embedded executables',
        'Verify PDF is not password protected for processing',
        'Check that PDF layers and annotations are print-ready'
      );
      break;
      
    case 'image/svg+xml':
      recommendations.push(
        'SVG files should not contain scripts or external references',
        'Verify SVG does not include embedded JavaScript',
        'Ensure SVG uses only standard elements and attributes'
      );
      break;
      
    case 'application/postscript':
    case 'application/x-photoshop':
      recommendations.push(
        'Design files should be flattened for security',
        'Remove any embedded scripts or actions',
        'Verify file does not contain external references'
      );
      break;
      
    default:
      recommendations.push(
        'Verify file is from a trusted source',
        'Ensure file has not been modified or corrupted'
      );
  }
  
  return recommendations;
}