#!/usr/bin/env node

import * as path from 'node:path'
import { getAnalyzeQuerySchema, queryAnalyzeData } from '../build/analyze/query'

export type NextAnalyzeQueryOptions = {
  query?: string
  querySchema?: string
  analyzeDir?: string
  input?: string
}

function analyzeDir(options: NextAnalyzeQueryOptions): string {
  return path.resolve(options.analyzeDir ?? '.next/diagnostics/analyze')
}

async function printJson(run: () => Promise<unknown>): Promise<void> {
  try {
    process.stdout.write(`${JSON.stringify(await run())}\n`)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Analyzer query failed'
    process.stderr.write(`${JSON.stringify({ error: message })}\n`)
    process.exitCode = 1
  }
}

export async function nextAnalyzeQuery(
  tool: string,
  options: NextAnalyzeQueryOptions
): Promise<void> {
  return printJson(async () => {
    const input: unknown = JSON.parse(options.input ?? '{}')
    if (typeof input !== 'object' || input === null || Array.isArray(input)) {
      throw new Error('--input must be a JSON object')
    }
    return queryAnalyzeData(
      analyzeDir(options),
      tool,
      input as Record<string, unknown>
    )
  })
}

export async function nextAnalyzeQuerySchema(
  tool: string,
  options: NextAnalyzeQueryOptions
): Promise<void> {
  return printJson(() => getAnalyzeQuerySchema(analyzeDir(options), tool))
}
