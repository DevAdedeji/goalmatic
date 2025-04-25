<template>
	<component :is="modals[id]" v-for="id in stack" :key="id" :props-modal="id" :payload="payloads[id]" @close="$emit('close')" />
</template>

<script setup lang="ts">

import { modal } from '@/composables/core/modal'

const { stack, modals, payloads } = modal

</script>
