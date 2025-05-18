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

watch(
  () => props.editable,
  (newEditable) => {
    editor.value?.setEditable(newEditable)
  }
)

// Cleanup
onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style src="./MentionEditor/Editor.scss" lang="scss"></style>
