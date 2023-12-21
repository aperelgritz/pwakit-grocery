// Alexis custom
import {useState} from 'react'

import {keysToCamel} from '@salesforce/retail-react-app/app/utils/utils'
import {isServer} from '@salesforce/retail-react-app/app/utils/utils'
import dayjs from 'dayjs'

import timeslotManagerConfig from '../../config/timeslot-manager'

export class TimeslotManagerAPI {
    constructor({host, corsProxy, clientId, clientSecret}) {
        this.host = host
        this.corsProxy = corsProxy
        this.clientId = clientId
        this.clientSecret = clientSecret
    }

    // Return access token
    async getAuthToken() {
        if (!isServer) {
            const authExpiration = window.localStorage.getItem('ts_manager_auth_exp')

            if (
                !authExpiration ||
                authExpiration == 'Invalid Date' ||
                new Date() > new Date(authExpiration)
            ) {
                const authRes = await this.fetchAuthToken()
                if (authRes) {
                    window.localStorage.setItem('ts_manager_auth_token', authRes.access_token)
                    const today = new Date()
                    window.localStorage.setItem(
                        'ts_manager_auth_exp',
                        new Date(today.setSeconds(today.getSeconds() + authRes.expires_in))
                    )
                    return authRes.access_token
                } else {
                    console.warn('Failed to fetch Timeslot Manager auth token.')
                }
            } else {
                return window.localStorage.getItem('ts_manager_auth_token')
            }
        } else {
            const authRes = await this.fetchAuthToken()
            return authRes.access_token
        }
    }

    // Send auth call
    async fetchAuthToken() {
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' + btoa(this.clientId + ':' + this.clientSecret)
        }

        let response
        try {
            response = await fetch(
                'https://account.demandware.com/dw/oauth2/access_token?grant_type=client_credentials',
                {
                    method: 'POST',
                    headers: headers
                }
            )
        } catch {
            console.warn('Timeslot manager auth request failed')
        }

        if (!response?.ok) {
            return {}
        }

        const responseJson = await response.json()

        return responseJson
    }

    // Build and call fetch
    async timeslotManagerFetch(endpoint, method, body = {}) {
        const authToken = await this.getAuthToken()
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`
        }

        let response
        try {
            response = await fetch(`${this.corsProxy}/${this.host}${endpoint}`, {
                method: method,
                headers: headers,
                ...(body && {
                    body: JSON.stringify(body)
                })
            })
        } catch {
            console.warn('Timeslot Manager request failed')
        }

        if (!response?.ok) {
            return {}
        }

        const responseJson = await response.json()
        const resJsonCamelCase = keysToCamel(responseJson)

        // if reservation call, store reservation id in local storage
        if (!isServer && endpoint.includes('/reservation')) {
            if (Object.keys(body).length === 0) {
                window.localStorage.setItem('ts_manager_res', '')
            } else {
                window.localStorage.setItem('ts_manager_res', JSON.stringify(resJsonCamelCase))
            }
        }

        return resJsonCamelCase
    }

    async searchFirstAvailableSlots(facility) {
        const endpoint = `/ias/api/shop/search`
        const method = 'POST'
        const body = {
            facilityUuid: facility,
            startDateTime: dayjs().format('YYYY-MM-DDTHH:MM:ss'),
            endDateTime: dayjs().add(20, 'd').format('YYYY-MM-DDTHH:MM:ss') // end date in 20 days
        }

        return this.timeslotManagerFetch(endpoint, method, body)
    }

    async softReserveSlot(slotId) {
        const endpoint = '/ias/api/shop/reservation'
        const method = 'POST'
        const body = {
            externalId: new Date().toISOString(),
            slotId
        }

        return this.timeslotManagerFetch(endpoint, method, body)
    }

    async cancelSlot(slotId) {
        const endpoint = `/ias/api/shop/reservation/${slotId}?cancelreq=true`
        const method = 'POST'
        const body = {}

        return this.timeslotManagerFetch(endpoint, method, body)
    }
}

const useTimeslotMgr = () => {
    // const host = 'https://gsk-timeslot.herokuapp.com'
    // const corsProxy = 'https://gsk-cors-anywhere-28a5ac32d250.herokuapp.com'
    // const clientId = '671e1f19-7665-4a18-b2e1-85e351635b2d'
    // const clientSecret = '8rB*}?Q!rTf9b13p?2uR.i$HMQcR,68/$lD(1x/z'

    const {host, corsProxy, clientId, clientSecret} = timeslotManagerConfig

    const timeslotManager = new TimeslotManagerAPI({host, corsProxy, clientId, clientSecret})

    const [isLoading, setIsLoading] = useState(false)

    return {
        isLoading,

        async timeslotMgrAuth() {
            return timeslotManager.getAuthToken()
        },

        async timeslotMgrSearchFirstSlots(facility) {
            return timeslotManager.searchFirstAvailableSlots(facility)
        },

        async timeslotMgrSoftReserve(slotId) {
            return timeslotManager.softReserveSlot(slotId)
        },

        async timeslotMgrCancelReserve(slotId) {
            return timeslotManager.cancelSlot(slotId)
        }
    }
}

export default useTimeslotMgr
