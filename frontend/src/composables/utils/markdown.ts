import { marked } from 'marked'

export const markdownProcessor = (value: string) => {
    // return value
  return marked.parse(value, { breaks: true, gfm: true })
}
