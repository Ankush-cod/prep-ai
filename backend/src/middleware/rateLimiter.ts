// src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts. Please try again in 15 minutes.',
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
});

export const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 45,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'AI endpoint rate limit exceeded. Please wait before sending more requests.',
    message: 'AI endpoint rate limit exceeded. Please wait before sending more requests.',
  },
});

export const codeExecutionRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Code execution rate limit exceeded. Please wait a few minutes.',
    message: 'Code execution rate limit exceeded. Please wait a few minutes.',
  },
});

export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP. Please slow down.',
    message: 'Too many requests from this IP. Please slow down.',
  },
});
