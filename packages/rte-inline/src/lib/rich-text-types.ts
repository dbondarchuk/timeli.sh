export type TextMark = {
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  superscript?: boolean
  subscript?: boolean
  color?: string
  backgroundColor?: string
  fontSize?: number | "inherit"
  fontFamily?: string | "inherit"
  fontWeight?: number | "inherit"
  letterSpacing?: "tight" | "normal" | "wide" | "inherit"
  textTransform?: "uppercase" | "lowercase" | "capitalize" | "none" | "inherit"
  lineHeight?: number | "inherit"
}

export type TextNode = {
  text: string
  marks?: TextMark
}

export type Block = {
  type: "paragraph"
  content: TextNode[]
}

export type RichTextValue = Block[]

export type DisabledFeatures = Array<keyof TextMark | "clearFormat" | "undo" | "redo">

export type VariableData = {
  [key: string]: string | number | VariableData
}

export type StylePluginConfig = {
  name: keyof TextMark
  label: string
  type: "boolean" | "color" | "select" | "number"
  icon?: string
  options?: Array<{ value: any; label: string; preview?: string }>
  defaultValue?: any
  inMoreMenu?: boolean
}
