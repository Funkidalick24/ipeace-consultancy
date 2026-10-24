import sanitizeHtml from 'sanitize-html';
import type { Request, Response, NextFunction } from 'express';

const sanitizeOptions = {
  allowedTags: [],
  allowedAttributes: {},
  disallowedTagsMode: 'discard' as const,
};

export const sanitizeBody = (fields: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    for (const field of fields) {
      if (req.body[field] && typeof req.body[field] === 'string') {
        req.body[field] = sanitizeHtml(req.body[field], sanitizeOptions);
      }
    }
    next();
  };
};

export const sanitizeAllBody = () => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const sanitizeValue = (value: unknown): unknown => {
      if (typeof value === 'string') {
        return sanitizeHtml(value, sanitizeOptions);
      }
      if (Array.isArray(value)) {
        return value.map(sanitizeValue);
      }
      if (value && typeof value === 'object') {
        const sanitized: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(value)) {
          sanitized[key] = sanitizeValue(val);
        }
        return sanitized;
      }
      return value;
    };

    req.body = sanitizeValue(req.body) as Record<string, unknown>;
    next();
  };
};