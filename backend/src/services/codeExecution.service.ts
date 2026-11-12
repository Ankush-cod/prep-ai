// src/services/codeExecution.service.ts
import { env, serviceStatus } from '../config/env';
import { BadRequestError, ServiceUnavailableError } from '../utils/errors';

export type SupportedLanguage = 'cpp' | 'python' | 'java' | 'javascript' | 'go';

export const ONLINECOMPILER_COMPILERS: Record<SupportedLanguage, string> = {
  cpp: 'g++-15',
  python: 'python-3.14',
  java: 'openjdk-25',
  javascript: 'nodejs-24',
  go: 'go-1.26',
};

const COMPILED_LANGUAGES = new Set<SupportedLanguage>(['cpp', 'java', 'go']);
const MAX_PAYLOAD_BYTES = 100 * 1024; // OnlineCompiler.io 100 KB limit for code and input
const REQUEST_TIMEOUT_MS = 35000;

interface OnlineCompilerSyncResponse {
  output?: string | null;
  error?: string | null;
  status?: string | null;
  exit_code?: number | null;
  signal?: number | string | null;
  truncated?: boolean;
  time?: string | number | null;
  total?: string | number | null;
  memory?: string | number | null;
}

export type ExecutionVerdict =
  | 'EXECUTED'
  | 'COMPILATION_ERROR'
  | 'RUNTIME_ERROR'
  | 'TIME_LIMIT_EXCEEDED'
  | 'MEMORY_LIMIT_EXCEEDED';

export interface NormalizedExecutionResult {
  compilerId: string;
  verdict: ExecutionVerdict;
  statusLabel: string;
  stdout: string;
  stderr: string;
  compileOutput: string;
  runtimeMs: number | null;
  memoryKb: number | null;
  exitCode: number | null;
  truncated: boolean;
}

function parseNumericMetric(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function isCompilationFailure(
  language: SupportedLanguage,
  rawStatus: string,
  stdout: string,
  errorText: string
): boolean {
  if (/compil/i.test(rawStatus)) {
    return true;
  }

  if (!COMPILED_LANGUAGES.has(language) || stdout.trim().length > 0 || !errorText.trim()) {
    return false;
  }

  return (
    /\b(error:|fatal error:|undefined reference|cannot find symbol|syntax error|was not declared|undeclared|cannot convert|ld returned \d+ exit status|compilation failed)\b/i.test(
      errorText
    ) || /\.(cpp|cc|c|java|go):\d+:/i.test(errorText)
  );
}

function normalizeOnlineCompilerResponse(
  language: SupportedLanguage,
  compilerId: string,
  data: OnlineCompilerSyncResponse
): NormalizedExecutionResult {
  const stdout = typeof data.output === 'string' ? data.output : '';
  const errorText = typeof data.error === 'string' ? data.error : '';
  const rawStatus = typeof data.status === 'string' ? data.status : '';
  const exitCode = typeof data.exit_code === 'number' ? data.exit_code : null;
  const hasSignal = data.signal !== null && data.signal !== undefined && data.signal !== '';

  const timeSec = parseNumericMetric(data.time);
  const runtimeMs = timeSec !== null ? Number((timeSec * 1000).toFixed(2)) : null;
  const rawMemory = parseNumericMetric(data.memory);
  const memoryKb = rawMemory !== null ? Math.round(rawMemory) : null;

  if (exitCode === 124 || /timeout|time[\s_-]*limit/i.test(rawStatus)) {
    return {
      compilerId,
      verdict: 'TIME_LIMIT_EXCEEDED',
      statusLabel: 'Time Limit Exceeded',
      stdout,
      stderr: errorText || 'Execution exceeded the allowed time limit.',
      compileOutput: '',
      runtimeMs,
      memoryKb,
      exitCode,
      truncated: Boolean(data.truncated),
    };
  }

  if (exitCode === 137 || /memory[\s_-]*limit/i.test(rawStatus)) {
    return {
      compilerId,
      verdict: 'MEMORY_LIMIT_EXCEEDED',
      statusLabel: 'Memory Limit Exceeded',
      stdout,
      stderr: errorText || 'Execution exceeded the allowed memory limit.',
      compileOutput: '',
      runtimeMs,
      memoryKb,
      exitCode,
      truncated: Boolean(data.truncated),
    };
  }

  if ((exitCode === 0 || (exitCode === null && rawStatus === 'success')) && !hasSignal) {
    return {
      compilerId,
      verdict: 'EXECUTED',
      statusLabel: 'Executed',
      stdout,
      stderr: errorText,
      compileOutput: '',
      runtimeMs,
      memoryKb,
      exitCode: exitCode ?? 0,
      truncated: Boolean(data.truncated),
    };
  }

  if (isCompilationFailure(language, rawStatus, stdout, errorText)) {
    return {
      compilerId,
      verdict: 'COMPILATION_ERROR',
      statusLabel: 'Compilation Error',
      stdout,
      stderr: '',
      compileOutput: errorText || 'Compilation failed.',
      runtimeMs,
      memoryKb,
      exitCode,
      truncated: Boolean(data.truncated),
    };
  }

  return {
    compilerId,
    verdict: 'RUNTIME_ERROR',
    statusLabel: exitCode === 153 ? 'Output Limit Exceeded' : 'Runtime Error',
    stdout,
    stderr:
      errorText ||
      (hasSignal ? `Process terminated with signal ${data.signal}.` : 'Runtime error.'),
    compileOutput: '',
    runtimeMs,
    memoryKb,
    exitCode,
    truncated: Boolean(data.truncated),
  };
}

export const codeExecutionService = {
  getCompilerId(language: SupportedLanguage): string {
    const compilerId = ONLINECOMPILER_COMPILERS[language];
    if (!compilerId) {
      throw new BadRequestError(`Unsupported language: ${language}`);
    }
    return compilerId;
  },

  async executeCode(params: {
    language: SupportedLanguage;
    sourceCode: string;
    stdin?: string;
    timeLimitSec?: number;
    memoryLimitKb?: number;
  }): Promise<NormalizedExecutionResult> {
    const compilerId = this.getCompilerId(params.language);

    if (!serviceStatus.hasOnlineCompiler) {
      throw new ServiceUnavailableError(
        'ONLINECOMPILER_API_KEY is not configured. Configure OnlineCompiler.io in backend/.env to execute submitted code safely in isolation.'
      );
    }

    if (Buffer.byteLength(params.sourceCode, 'utf8') > MAX_PAYLOAD_BYTES) {
      throw new BadRequestError('Source code exceeds the 100 KB sandbox limit.');
    }

    const stdin = params.stdin ?? '';
    if (Buffer.byteLength(stdin, 'utf8') > MAX_PAYLOAD_BYTES) {
      throw new BadRequestError('Standard input exceeds the 100 KB sandbox limit.');
    }

    const timeLimit = Math.min(Math.max(params.timeLimitSec ?? 5, 1), 30);
    const memoryLimitMb = Math.min(
      Math.max(Math.round((params.memoryLimitKb ?? 262144) / 1024), 16),
      512
    );

    const url = `${env.onlineCompilerApiUrl}/api/run-code-sync/`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: env.onlineCompilerApiKey,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          compiler: compilerId,
          code: params.sourceCode,
          input: stdin,
          time_limit: timeLimit,
          memory_limit: memoryLimitMb,
        }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new ServiceUnavailableError(
            'Code execution sandbox authentication failed. Verify ONLINECOMPILER_API_KEY configuration.'
          );
        }
        if (response.status === 429) {
          throw new ServiceUnavailableError(
            'Code execution sandbox rate limit or quota exceeded. Please try again later.'
          );
        }
        if (response.status === 400) {
          throw new BadRequestError('Invalid code execution request rejected by sandbox.');
        }
        throw new ServiceUnavailableError(
          `Code execution service returned HTTP ${response.status}.`
        );
      }

      const data = (await response.json()) as OnlineCompilerSyncResponse;
      return normalizeOnlineCompilerResponse(params.language, compilerId, data);
    } catch (err) {
      if (err instanceof ServiceUnavailableError || err instanceof BadRequestError) {
        throw err;
      }
      if (err instanceof Error && err.name === 'AbortError') {
        throw new ServiceUnavailableError(
          'Code execution timed out while waiting for the OnlineCompiler.io sandbox.'
        );
      }
      throw new ServiceUnavailableError(
        'Unable to reach OnlineCompiler.io execution sandbox. Please try again later.'
      );
    } finally {
      clearTimeout(timeout);
    }
  },
};
