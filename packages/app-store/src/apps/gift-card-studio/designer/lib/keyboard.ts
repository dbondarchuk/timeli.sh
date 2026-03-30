/**
 * Same rules as {@link isTypingInInput}, but usable from ClipboardEvent handlers
 * (copy / paste) and other code that only has an event target.
 */
export function isEditableClipboardTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;

  const tag = el.tagName?.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if (el.isContentEditable) return true;

  return false;
}

/**
 * Returns true when the keyboard event originated from an element where the
 * user is actively typing — an <input>, <textarea>, <select>, or any element
 * with contentEditable set.  Use this guard before firing editor shortcuts so
 * they do not interfere with normal text input in the properties panel or in
 * the in-canvas text editor.
 */
export function isTypingInInput(e: KeyboardEvent): boolean {
  return isEditableClipboardTarget(e.target);
}
