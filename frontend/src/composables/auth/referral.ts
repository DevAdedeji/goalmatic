import { useUser } from './user'
import { useAlert } from '@/composables/core/notification'
import { callFirebaseFunction } from '@/firebase/functions'

export const useReferral = () => {
  const { userProfile } = useUser()
  const loading = ref(false)
  const referralStats = ref<{
    referralCode: string | null
    totalReferrals: number
    referrals: Array<{
      id: string
      name: string
      email: string
      created_at: any
    }>
  } | null>(null)

  const referralCode = computed(() => {
    return userProfile.value?.referral_code || referralStats.value?.referralCode || ''
  })

  const referralUrl = computed(() => {
    if (!referralCode.value) return ''
    const baseUrl = process.client ? window.location.origin : 'https://goalmatic.io'
    return `${baseUrl}/signup?ref=${referralCode.value}`
  })

  const fetchReferralStats = async () => {
    loading.value = true
    try {
      const result = await callFirebaseFunction('getReferralStats', {}) as {
        referralCode: string | null
        totalReferrals: number
        referrals: Array<{
          id: string
          name: string
          email: string
          created_at: any
        }>
      }
      referralStats.value = result
      return result
    } catch (error) {
      console.error('Error fetching referral stats:', error)
      useAlert().openAlert({ type: 'ERROR', msg: 'Failed to load referral statistics' })
      return null
    } finally {
      loading.value = false
    }
  }

  const copyReferralCode = async () => {
    if (!referralCode.value) {
      useAlert().openAlert({ type: 'ERROR', msg: 'No referral code available' })
      return false
    }

    try {
      if (process.client && navigator.clipboard) {
        await navigator.clipboard.writeText(referralCode.value)
        useAlert().openAlert({ type: 'SUCCESS', msg: 'Referral code copied to clipboard!' })
        return true
      }
    } catch (error) {
      console.error('Failed to copy referral code:', error)
      useAlert().openAlert({ type: 'ERROR', msg: 'Failed to copy referral code' })
    }
    return false
  }

  const copyReferralUrl = async () => {
    if (!referralUrl.value) {
      useAlert().openAlert({ type: 'ERROR', msg: 'No referral URL available' })
      return false
    }

    try {
      if (process.client && navigator.clipboard) {
        await navigator.clipboard.writeText(referralUrl.value)
        useAlert().openAlert({ type: 'SUCCESS', msg: 'Referral link copied to clipboard!' })
        return true
      }
    } catch (error) {
      console.error('Failed to copy referral URL:', error)
      useAlert().openAlert({ type: 'ERROR', msg: 'Failed to copy referral link' })
    }
    return false
  }

  const shareReferral = async () => {
    const shareData = {
      title: 'Join Goalmatic',
      text: `Join me on Goalmatic using my referral code: ${referralCode.value}`,
      url: referralUrl.value
    }

    try {
      if (process.client && navigator.share) {
        await navigator.share(shareData)
        return true
      } else {
        // Fallback to copying the URL
        return await copyReferralUrl()
      }
    } catch (error) {
      console.error('Failed to share referral:', error)
      // Fallback to copying the URL
      return await copyReferralUrl()
    }
  }

  return {
    referralCode,
    referralUrl,
    referralStats,
    loading,
    fetchReferralStats,
    copyReferralCode,
    copyReferralUrl,
    shareReferral
  }
}
