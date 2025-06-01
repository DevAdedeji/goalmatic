export type ProfileType = {
	id: string | null;
	username: string;
	name: string;
	bio: string;
	email: string;
	phone: string;
	photo_url: string;
	referral_code: string;
	referred_by?: string | null;
	created_at: string;
	updated_at: string;
	showLogs?: boolean;
	selected_agent_id?: string | null;
};
