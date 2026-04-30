/** Forms app domain events (emitted from app-store). */

export const FORM_RESPONSE_CREATED_EVENT_TYPE =
  "form.response.created" as const;

/** Minimal shape for activity / handlers; full models may be present on envelope. */
export type FormResponseCreatedPayload = {
  formResponse: { _id: string; formId: string };
  form: { _id: string; name: string };
  customer?: { name?: string; email?: string } | null;
};
