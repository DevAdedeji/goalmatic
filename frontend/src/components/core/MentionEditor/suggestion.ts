import { VueRenderer } from '@tiptap/vue-3'
import tippy from 'tippy.js'
import FlowMentionList from './FlowMentionList.vue'
import AgentMentionList from './AgentMentionList.vue'
import { capitalize } from '@/composables/utils/formatter'
// @ts-ignore

// Types for better type safety
interface SuggestionConfig {
  mentionComponent: any
  itemsFilter: (data: any, query: string) => any[]
}

// Shared suggestion renderer factory
const createSuggestionRenderer = (config: SuggestionConfig) => {
  return (mentionData: any) => {
    return {
      items: ({ query }: { query: string }) => {
        return config.itemsFilter(mentionData, query)
      },

      render: () => {
        let component: any
        let popup: any

        return {
          onStart: (props: any) => {
            component = new VueRenderer(config.mentionComponent, {
              props,
              editor: props.editor
            })

            if (!props.clientRect) {
              return
            }

            popup = tippy('body', {
              getReferenceClientRect: props.clientRect,
              appendTo: () => document.body,
              content: component.element,
              showOnCreate: true,
              interactive: true,
              trigger: 'manual',
              placement: 'bottom-start'
            })
          },

          onUpdate(props: any) {
            component.updateProps(props)

            if (!props.clientRect) {
              return
            }

            popup[0].setProps({
              getReferenceClientRect: props.clientRect
            })
          },

          onKeyDown(props: any) {
            if (props.event.key === 'Escape') {
              popup[0].hide()
              return true
            }

            return component.ref?.onKeyDown(props)
          },

          onExit() {
            popup[0].destroy()
            component.destroy()
          }
        }
      }
    }
  }
}

// Flow-specific item filter
const flowItemsFilter = (mentionItemsObject: Record<string, any>, query: string) => {
  if (!mentionItemsObject || typeof mentionItemsObject !== 'object') return []

  const groups = Object.entries(mentionItemsObject).map(([key, children]) => {
    const filteredChildren = (children || []).filter((item: any) => {
      const label = typeof item === 'string' ? item : item.label || ''
      return label.toLowerCase().includes(query.toLowerCase())
    })
    return { key, children: filteredChildren }
  }).filter((group) => group.children.length > 0)

  return groups
}

// Agent-specific item filter
const agentItemsFilter = (mentionItemsObject: string[], query: string) => {
  return mentionItemsObject
    .filter((item) => item.toLowerCase().startsWith(query.toLowerCase()))
    .slice(0, 5)
}

// Public suggestion functions using the modular approach
export const flowSuggestion = createSuggestionRenderer({
  mentionComponent: FlowMentionList,
  itemsFilter: flowItemsFilter
})

export const agentSuggestion = createSuggestionRenderer({
  mentionComponent: AgentMentionList,
  itemsFilter: agentItemsFilter
})

export const formatEditorMention = (mention: string) => {
  if (!mention) return ''

  // Remove @ prefix and split by dashes
  const splitMain = mention.replace(/@/g, '').split('-')

  // Ensure we have at least 4 parts for proper formatting
  if (splitMain.length < 4) {
    // Fallback: return a basic formatted version or the original mention
    return mention.replace(/@/g, '')
  }

  // Safe access with fallbacks
  const triggerType = splitMain[1] || 'UNKNOWN'
  const rawTitle = splitMain[2] || ''
  const value = splitMain[3] || 'undefined'

  // Format the title by splitting underscores and capitalizing
  const capTitle = rawTitle
    ? rawTitle.split('_').map((i) => capitalize(i)).join(' ')
    : 'Unknown Field'

  const formatted = `(${triggerType}) ${capTitle} - ${value}`
  return formatted
}
