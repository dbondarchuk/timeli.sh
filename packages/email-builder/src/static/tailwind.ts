/* Static CSS for plate-static-editor - extracted from Tailwind classes */
/* All CSS variables replaced with hex colors, media queries removed */

export const tailwindCss = `/* Static CSS for plate-static-editor - extracted from Tailwind classes */
/* All CSS variables replaced with hex colors, media queries removed */

/* Editor base styles */
.group\\/editor {
  position: relative;
  width: 100%;
  cursor: text;
  overflow-x: hidden;
  word-break: break-word;
  user-select: text;
  border-radius: 6px;
  outline: none;
}

.group\\/editor:focus-visible {
  outline: none;
}

.group\\/editor [data-slate-placeholder] {
  top: auto !important;
  color: #64748b;
  opacity: 1 !important;
}

.group\\/editor::placeholder {
  color: #64748bcc;
}

.group\\/editor strong {
  font-weight: 700;
}

/* Editor variants */
.group\\/editor.w-full {
  width: 100%;
}

.group\\/editor.px-0 {
  padding-left: 0;
  padding-right: 0;
}

.group\\/editor.text-base {
  font-size: 16px;
  line-height: 24px;
}

.group\\/editor.max-h-\\[min\\(70vh\\,320px\\)\\] {
  max-height: min(70vh, 320px);
}

.group\\/editor.max-w-\\[700px\\] {
  max-width: 700px;
}

.group\\/editor.overflow-y-auto {
  overflow-y: auto;
}

.group\\/editor.px-5 {
  padding-left: 20px;
  padding-right: 20px;
}

.group\\/editor.py-3 {
  padding-top: 12px;
  padding-bottom: 12px;
}

.group\\/editor.size-full {
  width: 100%;
  height: 100%;
}

.group\\/editor.px-16 {
  padding-left: 64px;
  padding-right: 64px;
}

.group\\/editor.pt-4 {
  padding-top: 16px;
}

.group\\/editor.pb-72 {
  padding-bottom: 288px;
}

.group\\/editor.px-3 {
  padding-left: 12px;
  padding-right: 12px;
}

.group\\/editor.py-2 {
  padding-top: 8px;
  padding-bottom: 8px;
}

.group\\/editor.cursor-not-allowed {
  cursor: not-allowed;
}

.group\\/editor.opacity-50 {
  opacity: 0.5;
}

/* Blockquote */
.my-1 {
  margin-top: 4px;
  margin-bottom: 4px;
}

.border-l-2 {
  border-left-width: 2px;
  border-left-color: #e2e8f0;
}

.pl-6 {
  padding-left: 24px;
}

.italic {
  font-style: italic;
}

/* Code Block */
.py-1 {
  padding-top: 4px;
  padding-bottom: 4px;
}

.overflow-x-auto {
  overflow-x: auto;
}

.rounded-md {
  border-radius: 6px;
}

.bg-muted {
  background-color: #f1f5f9;
}

.px-6 {
  padding-left: 24px;
  padding-right: 24px;
}

.py-8 {
  padding-top: 32px;
  padding-bottom: 32px;
}

.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
}

.text-sm {
  font-size: 14px;
  line-height: 20px;
}

.leading-\\[normal\\] {
  line-height: normal;
}

/* Code Leaf */
.rounded-md {
  border-radius: 6px;
}

.px-\\[0\\.3em\\] {
  padding-left: 5px;
  padding-right: 5px;
}

.py-\\[0\\.2em\\] {
  padding-top: 3px;
  padding-bottom: 3px;
}

/* Column Element */
.group\\/column {
  position: relative;
}

.group\\/column.group-first\\/column\\:pl-0:first-child {
  padding-left: 0;
}

.group\\/column.group-last\\/column\\:pr-0:last-child {
  padding-right: 0;
}

.h-full {
  height: 100%;
}

.px-2 {
  padding-left: 8px;
  padding-right: 8px;
}

.pt-2 {
  padding-top: 8px;
}

.border {
  border-width: 1px;
  border-color: #e2e8f0;
}

.border-transparent {
  border-color: transparent;
}

.p-1\\.5 {
  padding: 6px;
}

/* Column Group */
.mb-2 {
  margin-bottom: 8px;
}

.flex {
  display: flex;
}

.size-full {
  width: 100%;
  height: 100%;
}

.rounded {
  border-radius: 4px;
}

/* Comment Leaf */
.border-b-2 {
  border-bottom-width: 2px;
}

.border-b-highlight\\/35 {
  border-bottom-color: #fde04759;
}

.bg-highlight\\/15 {
  background-color: #fde04726;
}

/* Date Element */
.inline-block {
  display: inline-block;
}

.w-fit {
  width: fit-content;
}

.rounded-sm {
  border-radius: 2px;
}

.px-1 {
  padding-left: 4px;
  padding-right: 4px;
}

.text-muted-foreground {
  color: #64748b;
}

/* Equation Element */
.my-1 {
  margin-top: 4px;
  margin-bottom: 4px;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.select-none {
  user-select: none;
}

.hover\\:bg-primary\\/10:hover {
  background-color: #0f172a1a;
}

.data-\\[selected\\=true\\]\\:bg-primary\\/10[data-selected="true"] {
  background-color: #0f172a1a;
}

.p-3 {
  padding: 12px;
}

.pr-9 {
  padding-right: 36px;
}

.px-2 {
  padding-left: 8px;
  padding-right: 8px;
}

.py-1 {
  padding-top: 4px;
  padding-bottom: 4px;
}

.h-7 {
  height: 28px;
}

.w-full {
  width: 100%;
}

.gap-2 {
  gap: 8px;
}

.whitespace-nowrap {
  white-space: nowrap;
}

.text-muted-foreground\\/80 {
  color: #64748bcc;
}

.size-6 {
  width: 24px;
  height: 24px;
}

/* Heading Element */
.relative {
  position: relative;
}

.mb-1 {
  margin-bottom: 4px;
}

.mt-\\[1\\.6em\\] {
  margin-top: 26px;
}

.pb-1 {
  padding-bottom: 4px;
}

.font-heading {
  font-family: inherit;
}

.text-4xl {
  font-size: 36px;
  line-height: 40px;
}

.font-bold {
  font-weight: 700;
}

.mt-\\[1\\.4em\\] {
  margin-top: 22px;
}

.pb-px {
  padding-bottom: 1px;
}

.text-2xl {
  font-size: 24px;
  line-height: 32px;
}

.font-semibold {
  font-weight: 600;
}

.tracking-tight {
  letter-spacing: -0.4px;
}

.mt-\\[1em\\] {
  margin-top: 16px;
}

.text-xl {
  font-size: 20px;
  line-height: 28px;
}

.mt-\\[0\\.75em\\] {
  margin-top: 12px;
}

.text-lg {
  font-size: 18px;
  line-height: 28px;
}

.text-base {
  font-size: 16px;
  line-height: 24px;
}

/* Highlight Leaf */
.bg-highlight\\/30 {
  background-color: #fde0474d;
}

.text-inherit {
  color: inherit;
}

/* HR Element */
.cursor-text {
  cursor: text;
}

.py-6 {
  padding-top: 24px;
  padding-bottom: 24px;
}

.h-0\\.5 {
  height: 2px;
}

.border-none {
  border-style: none;
}

.bg-clip-content {
  background-clip: content-box;
}

/* Image Element */
.py-2\\.5 {
  padding-top: 10px;
  padding-bottom: 10px;
}

.m-0 {
  margin: 0;
}

.max-w-full {
  max-width: 100%;
}

.min-w-\\[92px\\] {
  min-width: 92px;
}

.cursor-default {
  cursor: default;
}

.object-cover {
  object-fit: cover;
}

.px-0 {
  padding-left: 0;
  padding-right: 0;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.mt-2 {
  margin-top: 8px;
}

.h-\\[24px\\] {
  height: 24px;
}

/* Inline Equation */
.rounded-sm {
  border-radius: 2px;
}

.\\[&_\\.katex-display\\]\\:my-0 .katex-display {
  margin-top: 0;
  margin-bottom: 0;
}

.after\\:absolute::after {
  content: "";
  position: absolute;
}

.after\\:inset-0::after {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.after\\:-top-0\\.5::after {
  top: -2px;
}

.after\\:-left-1::after {
  left: -4px;
}

.after\\:z-1::after {
  z-index: 1;
}

/* Inline equation after pseudo-element styles */
.inline-equation-static::after {
  position: absolute;
  inset: 0;
  top: -2px;
  left: -4px;
  z-index: 1;
  height: calc(100% + 4px);
  width: calc(100% + 8px);
  border-radius: 2px;
  content: "";
}

.after\\:rounded-sm::after {
  border-radius: 2px;
}

.h-6 {
  height: 24px;
}

.after\\:bg-neutral-500\\/10::after {
  background-color: #7373731a;
}

.hidden {
  display: none;
}

.leading-none {
  line-height: 1;
}

/* KBD Leaf */
.border-border {
  border-color: #e2e8f0;
}

.px-1\\.5 {
  padding-left: 6px;
  padding-right: 6px;
}

.py-0\\.5 {
  padding-top: 2px;
  padding-bottom: 2px;
}

/* Link Element */
.font-medium {
  font-weight: 500;
}

.text-primary {
  color: #0f172a;
}

.underline {
  text-decoration-line: underline;
}

.decoration-primary {
  text-decoration-color: #0f172a;
}

.underline-offset-4 {
  text-underline-offset: 4px;
}

/* Media Audio Element */
.mb-1 {
  margin-bottom: 4px;
}

.size-full {
  width: 100%;
  height: 100%;
}

.h-16 {
  height: 64px;
}

/* Media File Element */
.my-px {
  margin-top: 1px;
  margin-bottom: 1px;
}

.cursor-pointer {
  cursor: pointer;
}

.items-center {
  align-items: center;
}

.rounded {
  border-radius: 4px;
}

.px-0\\.5 {
  padding-left: 2px;
  padding-right: 2px;
}

.py-\\[3px\\] {
  padding-top: 3px;
  padding-bottom: 3px;
}

.hover\\:bg-muted:hover {
  background-color: #f1f5f9;
}

.p-1 {
  padding: 4px;
}

.size-5 {
  width: 20px;
  height: 20px;
}

/* Media Video Element */
.w-full {
  width: 100%;
}

.max-w-full {
  max-width: 100%;
}

/* Mention Element */
.align-baseline {
  vertical-align: baseline;
}

/* Paragraph Element */
.m-0 {
  margin: 0;
}

.px-0 {
  padding-left: 0;
  padding-right: 0;
}

.py-1 {
  padding-top: 4px;
  padding-bottom: 4px;
}

/* Table Cell Element */
.overflow-visible {
  overflow: visible;
}

.border-none {
  border-style: none;
}

.bg-background {
  background-color: #ffffff;
}

.p-0 {
  padding: 0;
}

.text-left {
  text-align: left;
}

.font-normal {
  font-weight: 400;
}

.\\*\\:m-0 > * {
  margin: 0;
}

.before\\:size-full::before {
  width: 100%;
  height: 100%;
}

.before\\:absolute::before {
  position: absolute;
}

.before\\:box-border::before {
  box-sizing: border-box;
}

.before\\:select-none::before {
  user-select: none;
}

.before\\:border-b::before {
  border-bottom-width: 1px;
}

.before\\:border-b-border::before {
  border-bottom-color: #e2e8f0;
}

.before\\:border-r::before {
  border-right-width: 1px;
}

.before\\:border-r-border::before {
  border-right-color: #e2e8f0;
}

.before\\:border-l::before {
  border-left-width: 1px;
}

.before\\:border-l-border::before {
  border-left-color: #e2e8f0;
}

.before\\:border-t::before {
  border-top-width: 1px;
}

.before\\:border-t-border::before {
  border-top-color: #e2e8f0;
}

.z-20 {
  z-index: 20;
}

.box-border {
  box-sizing: border-box;
}

.px-4 {
  padding-left: 16px;
  padding-right: 16px;
}

.py-2 {
  padding-top: 8px;
  padding-bottom: 8px;
}

/* Table Element */
.overflow-x-auto {
  overflow-x: auto;
}

.py-5 {
  padding-top: 20px;
  padding-bottom: 20px;
}

.w-fit {
  width: fit-content;
}

.mr-0 {
  margin-right: 0;
}

.ml-px {
  margin-left: 1px;
}

.table {
  display: table;
}

.h-px {
  height: 1px;
}

.table-fixed {
  table-layout: fixed;
}

.border-collapse {
  border-collapse: collapse;
}

.min-w-full {
  min-width: 100%;
}

/* Table Row Element */
.h-full {
  height: 100%;
}

/* TOC Element */
.p-0 {
  padding: 0;
}

.block {
  display: block;
}

.h-auto {
  height: auto;
}

.cursor-pointer {
  cursor: pointer;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rounded-none {
  border-radius: 0;
}

.px-0\\.5 {
  padding-left: 2px;
  padding-right: 2px;
}

.py-1\\.5 {
  padding-top: 6px;
  padding-bottom: 6px;
}

.text-left {
  text-align: left;
}

.font-medium {
  font-weight: 500;
}

.underline {
  text-decoration-line: underline;
}

.decoration-\\[0\\.5px\\] {
  text-decoration-thickness: 0.5px;
}

.underline-offset-4 {
  text-underline-offset: 4px;
}

.hover\\:bg-accent:hover {
  background-color: #f1f5f9;
}

.hover\\:text-muted-foreground:hover {
  color: #64748b;
}

.pl-0\\.5 {
  padding-left: 2px;
}

.pl-\\[26px\\] {
  padding-left: 26px;
}

.pl-\\[50px\\] {
  padding-left: 50px;
}

.text-gray-500 {
  color: #6b7280;
}

/* Toggle Element */
.pl-6 {
  padding-left: 24px;
}

.absolute {
  position: absolute;
}

.top-0 {
  top: 0;
}

.-left-0\\.5 {
  left: -2px;
}

.size-6 {
  width: 24px;
  height: 24px;
}

.justify-center {
  justify-content: center;
}

.rounded-md {
  border-radius: 6px;
}

.p-px {
  padding: 1px;
}

.transition-colors {
  transition-property: color, background-color, border-color,
    text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.select-none {
  user-select: none;
}

.hover\\:bg-accent:hover {
  background-color: #f1f5f9;
}

.\\[&_svg\\]\\:size-4 svg {
  width: 16px;
  height: 16px;
}

.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.duration-75 {
  transition-duration: 75ms;
}

.rotate-0 {
  transform: rotate(0deg);
}

/* Todo Marker */
.pointer-events-none {
  pointer-events: none;
}

.top-1 {
  top: 4px;
}

.-left-6 {
  left: -24px;
}

/* Todo Li */
.list-none {
  list-style-type: none;
}

.line-through {
  text-decoration-line: line-through;
}

/* Checkbox Static */
/* Note: .peer is a Tailwind utility that works with sibling selectors, no CSS needed */

.shrink-0 {
  flex-shrink: 0;
}

.border-primary {
  border-color: #0f172a;
}

.focus-visible\\:outline-none:focus-visible {
  outline: none;
}

.data-\\[state\\=checked\\]\\:bg-primary[data-state="checked"] {
  background-color: #0f172a;
}

.data-\\[state\\=checked\\]\\:text-primary-foreground[data-state="checked"] {
  color: #f8fafc;
}

.text-current {
  color: currentColor;
}

/* Fire Marker */
.select-none {
  user-select: none;
}

/* Fire Li Component */
.list-none {
  list-style-type: none;
}
`;
