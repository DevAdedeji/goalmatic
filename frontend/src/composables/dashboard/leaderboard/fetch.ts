import { ref } from 'vue'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/firebase/init'
import { useAlert } from '@/composables/core/notification'

// Define the leaderboard data type
export interface LeaderboardUser {
  id: string
  name: string
  photo_url: string
  points: number
  agents_cloned: number
}

// Create a ref to store the leaderboard data
const leaderboardData = ref<LeaderboardUser[]>([])
const loading = ref(false)

export const useFetchLeaderboard = () => {
  const fetchLeaderboard = async (limitCount = 50) => {
    loading.value = true
    leaderboardData.value = []

    try {
      // Query the leaderboard collection, ordered by points in descending order
      const leaderboardRef = collection(db, 'leaderboard')
      const leaderboardQuery = query(
        leaderboardRef,
        orderBy('points', 'desc'),
        limit(limitCount)
      )

      const querySnapshot = await getDocs(leaderboardQuery)

      // Process the query results
      querySnapshot.forEach((doc) => {
        const userData = doc.data() as LeaderboardUser
        leaderboardData.value.push({
          id: doc.id,
          name: userData.name || 'Unknown User',
          photo_url: userData.photo_url || '',
          points: userData.points || 0,
          agents_cloned: userData.agents_cloned || 0
        })
      })
    } catch (error: any) {
      console.error('Error fetching leaderboard:', error)
      useAlert().openAlert({
        type: 'ERROR',
        msg: `Error fetching leaderboard: ${error.message}`
      })
    } finally {
      loading.value = false
    }
  }

  return {
    leaderboardData,
    loading,
    fetchLeaderboard
  }
}
