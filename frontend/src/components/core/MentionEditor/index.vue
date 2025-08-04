<template>
	<div class="tiptap-editor">
		<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
		<editor-content :editor="editor" :class="classNode" />
	</div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Mention from '@tiptap/extension-mention'
import { flowSuggestion, formatEditorMention } from './suggestion'


const props = defineProps({
	modelValue: { type: String, default: '' },
	mentionItems: { type: Object, default: () => {} },
	classNode: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])

const editor = ref<any>()

console.log('MentionEditor - mentionItems:', props.mentionItems)


editor.value = new Editor({
	content: props.modelValue,
	extensions: [
		StarterKit,
		Mention.configure({
			renderHTML({ node }) {
				return `${formatEditorMention(node.attrs.label ?? node.attrs.id)}`
			},
			HTMLAttributes: { class: 'mention' },
			deleteTriggerWithBackspace: true,
			suggestion: flowSuggestion(props.mentionItems)
		})
	],
	onUpdate: ({ editor }) => {
		emit('update:modelValue', editor.getHTML())
	}
})

watch(
	() => props.modelValue,
	(newValue) => {
		if (editor.value && newValue !== editor.value.getHTML()) {
			editor.value.commands.setContent(newValue, false)
		}
	}
)

onBeforeUnmount(() => {
	editor.value?.destroy()
})
</script>

<style src="./Editor.scss" lang="scss"></style>

