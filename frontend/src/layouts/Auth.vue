<template>
	<div class=" !bg-[#FBFBFE] ">
		<section class="flex flex-col min-h-screen h-full w-full container items-center justify-center">
			<div class="bg-light h-[60px] flex items-center gap-4 px-5 md:px-14 border-b shrink-0 absolute top-0 left-0 right-0">
				<img src="@/assets/img/logo.svg" alt="" class="h-7">
			</div>
			<slot />
		</section>
	</div>
	<Alert />
	<ModalBase />
</template>

<script setup lang="ts">

</script>

<style scoped>



</style>
