import { callFirebaseFunction } from '@/firebase/functions'
import { useAlert } from '@/composables/core/notification'

export const useReferralDiscount = () => {
  const loading = ref(false)
  const discountApplied = ref(false)
  const discountData = ref<{
    original_amount: number
    discount_amount: number
    final_amount: number
    discount_percentage: number
    referrer_name: string
  } | null>(null)

  const applyReferralDiscount = async (referralCode: string, subscriptionAmount: number) => {
    loading.value = true
    try {
      const result = await callFirebaseFunction('applyReferralDiscount', {
        referralCode,
        subscriptionAmount
      }) as {
        success: boolean
        discount: {
          original_amount: number
          discount_amount: number
          final_amount: number
          discount_percentage: number
          referrer_name: string
        }
      }

      if (result.success) {
        discountApplied.value = true
        discountData.value = result.discount
        useAlert().openAlert({
          type: 'SUCCESS',
          msg: `Referral discount applied! You saved $${result.discount.discount_amount.toFixed(2)}`
        })
        return result.discount
      }

      return null
    } catch (error: any) {
      console.error('Error applying referral discount:', error)
      useAlert().openAlert({
        type: 'ERROR',
        msg: error.message || 'Failed to apply referral discount'
      })
      return null
    } finally {
      loading.value = false
    }
  }

  const clearDiscount = () => {
    discountApplied.value = false
    discountData.value = null
  }

  return {
    loading,
    discountApplied,
    discountData,
    applyReferralDiscount,
    clearDiscount
  }
}
