import { marked } from 'marked'
import markedMoreLists from 'marked-more-lists'


export const markdownProcessor = (value: string) => {
  marked.use(markedMoreLists())
  // return marked.parse(value, { breaks: true, gfm: true })
  return marked.parse(value, {
    breaks: true,
    gfm: true

  })
}
