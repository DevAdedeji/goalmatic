<template>
	<div class="relative w-full" @click.stop>
		<ClientOnly>
			<DropdownMenuRoot>
				<DropdownMenuTrigger class="dropdownBtn">
					<img src="/og.png" alt="agent" class="size-3.5">
					<span class="text-xs font-medium text-dark">{{ selectedAgent.name }}</span>
					<ChevronDown class="size-4" />
				</DropdownMenuTrigger>

				<DropdownMenuPortal>
					<DropdownMenuContent align="start" class="dropdownBtnContent">
						<DropdownMenuItem class="flex items-center gap-2 p-2  rounded-lg cursor-pointer hover:bg-[#601DED1A]">
							<IconsStick />
							<div class="flex flex-col">
								<span class="text-xs font-semibold text-primary">{{ selectedAgent.name }}</span>
								<span class="text-[10px] font-medium text-primary truncate w-40 flex-wrap">{{ selectedAgent.description }}</span>
							</div>
							<div class="ml-auto">
								<Eye class="size-4 text-[#1300A0]" />
							</div>
						</DropdownMenuItem>

						<hr class="border-t border-[#601DED24] my-2">
						<DropdownMenuItem class="flex items-center gap-2 p-2  rounded-lg cursor-pointer hover:bg-[#601DED1A]" @click="$router.push('/agents/explore')">
							<IconsCompass />
							<div class="flex flex-col">
								<span class="text-xs font-semibold text-primary">Discover More Agent</span>
								<span class="text-[10px] font-medium text-primary">Find the agent for you</span>
							</div>
							<div class="ml-auto">
								<ArrowRight class="size-4 text-[#1300A0]" />
							</div>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenuPortal>
			</DropdownMenuRoot>
		</ClientOnly>
	</div>
</template>

<script setup>
import { ChevronDown, Eye, ArrowRight, Compass } from 'lucide-vue-next'
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuRoot, DropdownMenuTrigger } from 'radix-vue'

const props = defineProps({
	selectedAgent: {
		type: Object,
		required: true
	}
})
</script>

<style scoped>
.dropdownBtn{
display: flex;
padding: 8px 12px;
justify-content: center;
align-items: center;
gap: 4px;
border-radius: 8px;
border: 1px solid #E9E9E9;
background:  #F7F8FA;
box-shadow: 0px 1px 3px 0px rgba(25, 33, 61, 0.10);
 }

 :deep(.dropdownBtnContent){
	display: flex;
width: 580px;
height: 443px;
padding: 24px;
flex-direction: column;
align-items: flex-start;
gap: 16px;
border-radius: 16px;
border: 2px solid #F9F8FB;
background: #FFF;
box-shadow: 0px 8px 15px 0px rgba(25, 33, 61, 0.10);
 }
</style>
