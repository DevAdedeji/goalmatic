import { VueRenderer } from '@tiptap/vue-3'
import tippy from 'tippy.js'

// @ts-ignore
import MentionList from './MentionList.vue'

export const suggestion = (mentionItemsObject: Record<string, any>) => {
  return {
    items: ({ query }) => {
      if (!mentionItemsObject || typeof mentionItemsObject !== 'object') return []
      const groups = Object.entries(mentionItemsObject).map(([key, children]) => {
        const filteredChildren = (children || []).filter((item: any) => {
          const label = typeof item === 'string' ? item : item.label || ''
          return label.toLowerCase().includes(query.toLowerCase())
        })
        return { key, children: filteredChildren }
      }).filter((group) => group.children.length > 0)
      return groups
    },

      render: () => {
        let component
        let popup

        return {
          onStart: (props) => {
            component = new VueRenderer(MentionList, {
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

          onUpdate(props) {
            component.updateProps(props)

            if (!props.clientRect) {
              return
            }

            popup[0].setProps({
              getReferenceClientRect: props.clientRect
            })
          },

          onKeyDown(props) {
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
