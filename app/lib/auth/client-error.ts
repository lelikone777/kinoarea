type FlattenLikeError = {
  formErrors?: unknown;
  fieldErrors?: Record<string, unknown> | unknown;
};

type ApiErrorPayload = {
  error?: unknown;
};

function firstStringFromUnknownArray(value: unknown): string | null {
  if (!Array.isArray(value)) return null;
  for (const item of value) {
    if (typeof item === "string" && item.trim()) return item;
  }
  return null;
}

function parseFlattenLikeError(value: FlattenLikeError): string | null {
  const formError = firstStringFromUnknownArray(value.formErrors);
  if (formError) return formError;

  if (value.fieldErrors && typeof value.fieldErrors === "object") {
    for (const fieldValue of Object.values(value.fieldErrors as Record<string, unknown>)) {
      const fieldError = firstStringFromUnknownArray(fieldValue);
      if (fieldError) return fieldError;
    }
  }

  return null;
}

export function getApiErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;

  const maybeError = (payload as ApiErrorPayload).error;
  if (typeof maybeError === "string" && maybeError.trim()) return maybeError;

  if (maybeError && typeof maybeError === "object") {
    const flattenMessage = parseFlattenLikeError(maybeError as FlattenLikeError);
    if (flattenMessage) return flattenMessage;
  }

  return fallback;
}
