

const ALERT_DURATION = 5000

/**
 * Alert position options
 *
 * - top-right (default): Shows alert in the top right corner
 * - top-left: Shows alert in the top left corner
 * - bottom-right: Shows alert in the bottom right corner
 * - bottom-left: Shows alert in the bottom left corner
 * - top-center: Shows alert in the top center
 * - bottom-center: Shows alert in the bottom center
 */
export type AlertPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'bottom-center'

const openAlertArray = ref([] as Record<string, any>[])

interface AlertTypes {
	type: 'Alert' | 'ERROR' | 'SUCCESS'
	msg: string
	addrs?: string
	position?: AlertPosition
}

export const useAlert = () => {
	/**
	 * Display an alert notification
	 *
	 * @param {Object} options - Alert options
	 * @param {'Alert' | 'ERROR' | 'SUCCESS'} options.type - Type of alert
	 * @param {string} options.msg - Message to display
	 * @param {string} [options.addrs] - Additional address info (shown only in dev mode)
	 * @param {AlertPosition} [options.position='top-right'] - Position of the alert
	 *
	 * @example
	 * // Show a success alert in the bottom-left corner
	 * openAlert({
	 *   type: 'SUCCESS',
	 *   msg: 'Operation completed successfully',
	 *   position: 'bottom-left'
	 * })
	 */
	const openAlert = ({ type, msg, addrs, position = 'top-right' }: AlertTypes) => {
		const id = Date.now().toString()
		openAlertArray.value.push({ id, type, msg, addrs, position })
	}

	/**
	 * Close an alert by ID
	 *
	 * @param {string} id - ID of the alert to close
	 */
	const closeAlert = (id: string) => {
		openAlertArray.value = openAlertArray.value.filter((alert: any) => alert.id !== id)
	}

	return { openAlert, closeAlert, ALERT_DURATION, openAlertArray }
}



