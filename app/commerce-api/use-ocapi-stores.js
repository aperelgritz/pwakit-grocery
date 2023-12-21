// Alexis custom
import {useState} from 'react'

import fetch from 'cross-fetch'

import {getConfig} from '@salesforce/pwa-kit-runtime/utils/ssr-config'
import {getAppOrigin} from '@salesforce/pwa-kit-react-sdk/utils/url'
import {keysToCamel} from '@salesforce/retail-react-app/app/utils/utils'
import {useAccessToken} from '@salesforce/commerce-sdk-react'
import {isServer} from '@salesforce/retail-react-app/app/utils/utils'

const {app: appConfig} = getConfig()
const apiConfig = {
    ...appConfig.commerceAPI
}

// Hook returns fetching function, which sets stores in states and also returns stores JSON
export const useOcapiStores = (setStores) => {
    const [error, setError] = useState()
    const [isLoading, setIsLoading] = useState(true)
    const {getTokenWhenReady} = useAccessToken()
    const proxy = `/mobify/proxy/ocapi`
    const host = `${getAppOrigin()}${proxy}`

    // Fetch all stores or local stores if passed lat, long, dist
    const fetchStores = async (lat = '24.3356791', long = '23.76995359', dist = '20000') => {
        const token = await getTokenWhenReady()

        const headers = {
            'Content-Type': 'application/json',
            'x-dw-client-id': apiConfig.parameters.clientId,
            authorization: `Bearer ${token}`
        }

        try {
            const response = await fetch(
                `${host}/s/${apiConfig.parameters.siteId}/dw/shop/v21_3/stores?latitude=${lat}&longitude=${long}&max_distance=${dist}`,
                {
                    method: 'GET',
                    headers: headers
                }
            )
            const responseJson = await response.json()
            const resStores = keysToCamel(responseJson.data)
            setStores(resStores)

            // store original store list in local storage
            if (!isServer && dist == '20000') {
                window.localStorage.setItem('originalStores', JSON.stringify(resStores))
            }

            return resStores
        } catch (e) {
            console.warn(`GET all stores request failed with error: ${e}`)
            setError(e)
        } finally {
            setIsLoading(false)
        }
    }

    return {isLoading, error, fetchStores}
}
