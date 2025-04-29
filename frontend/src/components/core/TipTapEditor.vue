<template>
	<div class="tiptap-editor">
		<editor-content :editor="editor" />
	</div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  editable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

const editor = useEditor({
  content: props.modelValue,
  editable: props.editable,
  extensions: [
    StarterKit,
    TextStyle,
    Color
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  }
})

// Ensure editor content stays in sync with v-model
watch(
  () => props.modelValue,
  (newContent) => {
    const isSame = newContent === editor.value?.getHTML()
    if (editor.value && !isSame) {
      editor.value.commands.setContent(newContent, false)
    }
  }
)

// Cleanup
onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style lang="scss">
.tiptap-editor {
  .ProseMirror {
    outline: none;
    min-height: 100px;
    padding: 0.5rem;

    > * + * {
      margin-top: 0.75em;
    }

    p.is-editor-empty:first-child::before {
      color: #adb5bd;
      content: attr(data-placeholder);
      float: left;
      height: 0;
      pointer-events: none;
    }

    ul,
    ol {
      padding: 0 1rem;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      line-height: 1.1;
    }

    code {
      background-color: rgba(#616161, 0.1);
      color: #616161;
    }

    pre {
      background: #0D0D0D;
      color: #FFF;
      font-family: 'JetBrainsMono', monospace;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;

      code {
        color: inherit;
        padding: 0;
        background: none;
        font-size: 0.8rem;
      }
    }

    img {
      max-width: 100%;
      height: auto;
    }

    blockquote {
      padding-left: 1rem;
      border-left: 2px solid rgba(#0D0D0D, 0.1);
    }

    hr {
      border: none;
      border-top: 2px solid rgba(#0D0D0D, 0.1);
      margin: 2rem 0;
    }
  }
}
</style>
