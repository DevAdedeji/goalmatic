<template>
	<main class="flex flex-col items-start w-full px-4 md:px-8 py-10">
		<div class="w-full flex flex-col gap-4">
			<h1 class="text-[22px] font-bold">
				Settings
			</h1>

			<!-- Profile Image Card -->
			<div class="bg-white flex flex-col items-center  my-4">
				<ProfilePhoto v-if="userProfile" size="50px" :photo-url="userProfile.photo_url" :folder-name="`bookings/users/profile/${user_id}`" @update="updatePhoto" />
			</div>

			<!-- Personal Information Card -->
			<div class="bg-white rounded-lg border border-line p-4 ">
				<div class="flex flex-wrap gap-2 items-center justify-between mb-6">
					<h2 class="text-lg font-bold">
						Personal Information
					</h2>
					<button v-if="isDisabled" class="btn-primary ml-auto" @click="isDisabled = false">
						Edit Profile
					</button>
					<button v-else class="btn-primary font-medium" :disabled="profileLoading" @click="update">
						<span v-if="!profileLoading">Save changes</span>
						<Spinner v-else />
					</button>
				</div>
				<div class="flex flex-col gap-4">
					<div class="field">
						<label>Full name</label>
						<input id="first_name" v-model="userProfileForm.name.value" type="text" class="input-field" :disabled="isDisabled" required>
					</div>
					<div class="field">
						<label>Bio</label>
						<textarea v-model="userProfileForm.bio.value" placeholder="Add a bio" rows="3" class="input-textarea" :disabled="isDisabled" />
					</div>
					<div class="field">
						<label>Email</label>
						<input id="email" v-model="userProfileForm.email.value" type="text" class="input-field" :disabled="true" required>
					</div>
					<div class="field">
						<label>Username</label>
						<input id="username" v-model="userProfileForm.username.value" type="text" class="input-field" :disabled="true" required>
					</div>
					<div class="field">
						<label>Phone number</label>
						<input id="phone" v-model="userProfileForm.phone.value" type="text" class="input-field" :disabled="true" required>
					</div>
				</div>
			</div>

			<!-- Logs Card -->
			<div class="bg-white rounded-lg border border-line p-4 flex items-center justify-between">
				<div>
					<h2 class="text-lg font-bold mb-1">
						Logs
					</h2>
					<p class="text-gray-500 text-sm">
						Show logs in your account
					</p>
				</div>

				<Switch v-model="userProfileForm.showLogs.value" :disabled="isDisabled" class="w-6 h-6" />
			</div>
		</div>
	</main>
</template>

<script setup lang="ts">
import { usePageHeader } from '@/composables/utils/header'
import { useUser } from '@/composables/auth/user'
import { useUpdateUserProfile } from '@/composables/auth/profile/edit'


const { user, id: user_id, userProfile } = useUser()
const { isDisabled, loading: profileLoading, populateData, update, updatePhoto, userProfileForm } = useUpdateUserProfile()

populateData()

definePageMeta({
	layout: 'dashboard',
	middleware: ['is-authenticated', () => {
		usePageHeader().setPageHeader({
			title: 'Settings',
			description: 'Manage your account settings here'
		})
	}]
})
</script>

<style scoped lang="scss">
.field{
	@apply flex flex-row gap-2 items-center;
	label{
		@apply w-[50%] text-[14px] font-medium;
	}
}
</style>
