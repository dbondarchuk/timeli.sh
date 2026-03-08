/**
 * Returns true when the keyboard event originated from an element where the
 * user is actively typing — an <input>, <textarea>, <select>, or any element
 * with contentEditable set.  Use this guard before firing editor shortcuts so
 * they do not interfere with normal text input in the properties panel or in
 * the in-canvas text editor.
 */
export function isTypingInInput(e: KeyboardEvent): boolean {
  const target = e.target as HTMLElement | null;
  if (!target) return false;

  const tag = target.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if (target.isContentEditable) return true;

  return false;
}
