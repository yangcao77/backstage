/*
 * Copyright 2025 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  ErrorLike,
  ForwardedError,
  isError,
  serializeError,
} from '@backstage/errors';

import { Server as McpServer } from '@modelcontextprotocol/sdk/server/index.js';

const knownErrors = new Set([
  'InputError',
  'AuthenticationError',
  'NotAllowedError',
  'NotFoundError',
  'ConflictError',
  'NotModifiedError',
  'NotImplementedError',
  'ResponseError',
  'ServiceUnavailableError',
  'ForwardedError',
]);

// Unwrap ForwardedError to get the underlying error (e.g. ResponseError).
function getCause(err: unknown): unknown {
  if (err instanceof ForwardedError && err.cause !== undefined) {
    return err.cause;
  }
  if (
    err instanceof Error &&
    'cause' in err &&
    isError((err as ErrorLike).cause)
  ) {
    return (err as ErrorLike).cause;
  }
  return err;
}

// Error-like with optional body (e.g. ResponseError from fetch).
function hasBody(
  err: unknown,
): err is {
  body?: { error?: { message?: string }; errors?: unknown };
  message?: string;
} {
  return err !== null && typeof err === 'object';
}

/**
 * Walks the cause chain (ForwardedError / error.cause) and yields each error.
 */
function* walkCauseChain(err: unknown): Generator<unknown> {
  let current: unknown = err;
  const seen = new Set<unknown>();
  while (
    current !== null &&
    current !== undefined &&
    typeof current === 'object'
  ) {
    if (seen.has(current)) break;
    seen.add(current);
    yield current;
    current = getCause(current);
    if (current === err) break;
  }
}

/**
 * Tries to parse a message that may contain inline JSON (e.g. "Request failed with status 400..., {...}").
 * If it contains an "errors" array, returns a concise list of each item's "message" or "stack".
 */
function formatMessageWithInlineErrors(message: string): string {
  const commaJson = message.indexOf(', {');
  if (commaJson === -1) return message;
  try {
    const jsonStr = message.slice(commaJson + 2).trim();
    const data = JSON.parse(jsonStr) as {
      errors?: Array<{ message?: string; stack?: string }>;
    };
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      const parts = data.errors.map(
        e => (typeof e.message === 'string' ? e.message : e.stack) ?? String(e),
      );
      return parts.join('; ');
    }
  } catch {
    // ignore parse errors
  }
  return message;
}

type SerializedErrorNode = {
  message?: string;
  name?: string;
  cause?: SerializedErrorNode;
  body?: { error?: { message?: string }; errors?: unknown };
};

/**
 * Walks the serialized cause chain (body.error.cause → cause.cause → ...) and
 * returns the first message found in a nested .body (the real backend error), or
 * the deepest .message that is not a generic wrapper.
 *
 * When the MCP backend invokes an action over HTTP, the actions API returns 500
 * with a serialized error. The client gets a ResponseError whose body contains
 * that chain; the real message is nested at body.error.cause.cause.body.error.message.
 */
function extractFromSerializedCause(
  node: SerializedErrorNode | null | undefined,
): string | undefined {
  if (!node || typeof node !== 'object') return undefined;

  // Prefer message from a nested .body (actual backend error).
  if (node.body?.error?.message) {
    const msg = String(node.body.error.message);
    return formatMessageWithInlineErrors(msg);
  }

  // Recurse into cause first to find the deepest body.
  const fromCause = extractFromSerializedCause(node.cause);
  if (fromCause !== undefined) return fromCause;

  // No nested body; use this node's message if it's not a generic wrapper.
  if (typeof node.message === 'string' && node.message.length > 0) {
    const m = node.message;
    if (
      !m.startsWith('Failed execution of action ') &&
      !m.startsWith('Request failed with ')
    ) {
      return m;
    }
  }
  return undefined;
}

/**
 * Extracts user-facing error details from ResponseError errors (e.g. from
 * Backstage API calls). Returns a single string suitable for the MCP client,
 * or undefined if the error has no HTTP/response body to extract.
 *
 * Handles two cases:
 * 1) In-process: error chain has real ResponseError with .body (walkCauseChain).
 * 2) Over HTTP: the error is a ResponseError from the invoke call; the real
 *    message is nested in body.error.cause.cause.body (extractFromSerializedCause).
 */
function extractErrorMessageFromResponse(err: unknown): string | undefined {
  // Case 2: This error is from HTTP (invoke returned 500). Body contains serialized chain.
  const topBody =
    err !== null && typeof err === 'object' && 'body' in err
      ? (err as { body?: { error?: SerializedErrorNode } }).body
      : undefined;
  if (topBody?.error) {
    const fromSerialized = extractFromSerializedCause(topBody.error);
    if (fromSerialized !== undefined) return fromSerialized;
  }

  // Case 1: In-process chain (real ResponseError with .body in the chain).
  for (const sourceErr of walkCauseChain(err)) {
    if (!hasBody(sourceErr) || !(sourceErr as { body?: unknown }).body)
      continue;

    const body = (
      sourceErr as { body: { error?: { message?: string }; errors?: unknown } }
    ).body;
    const parts: string[] = [];

    if (body?.error?.message) {
      const msg = String(body.error.message);
      parts.push(formatMessageWithInlineErrors(msg));
    }
    if (body?.errors !== undefined) {
      const errors = Array.isArray(body.errors) ? body.errors : [body.errors];
      parts.push(
        ...errors.map(e =>
          typeof e === 'object' && e !== null && 'message' in e
            ? String((e as { message?: string }).message ?? e)
            : String(e),
        ),
      );
    }
    if (parts.length > 0) {
      return parts.join('; ');
    }
  }
  return undefined;
}

// Extracts the cause error, if the provided error is `ResponseError` or
// `ForwardedError` with a cause.
function extractCause(err: ErrorLike): ErrorLike {
  if (
    (err.name === 'ResponseError' || err instanceof ForwardedError) &&
    isError(err.cause)
  ) {
    return err.cause;
  }
  return err;
}

/**
 * Takes a value expected to be an object, and returns a description of the
 * error to return to the MCP client, if the error is a known Backstage error.
 * For ResponseError-like errors, includes details from body.error and body.errors.
 *
 * Re-throws the original error otherwise
 */
function describeError(err: unknown): string {
  console.log('************************ in describeError', err);
  if (err instanceof Error) {
    const serialized = serializeError(err);
    const { name, message } = extractCause(serialized);

    if (knownErrors.has(name)) {
      const richMessage = extractErrorMessageFromResponse(err);
      console.log('************************richMessage', richMessage);
      return richMessage ?? `${name}: ${message}`;
    }
  }

  throw err;
}

type RequestResultType = ReturnType<
  Parameters<McpServer['setRequestHandler']>[1]
>;
/**
 * Wraps a request function with an error handler that turns known Backstage
 * errors into user-friendly messages, instead of failing the request
 * generically with a 500.
 */
export async function handleErrors(
  fn: () => RequestResultType | Promise<RequestResultType>,
): Promise<RequestResultType> {
  try {
    return await fn();
  } catch (err) {
    // This will rethrow if the error is not a known Backstage error
    const description = describeError(err);
    return {
      content: [{ type: 'text', text: description }],
      isError: true,
    };
  }
}
