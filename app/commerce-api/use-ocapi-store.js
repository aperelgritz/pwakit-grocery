// Alexis custom
import {useState} from 'react'

import fetch from 'cross-fetch'

import {getConfig} from '@salesforce/pwa-kit-runtime/utils/ssr-config'
import {getAppOrigin} from '@salesforce/pwa-kit-react-sdk/utils/url'
import {keysToCamel} from '@salesforce/retail-react-app/app/utils/utils'
import {useAccessToken} from '@salesforce/commerce-sdk-react'

// Hook returns fetching function, which sets store in state and also returns store JSON
export const useOcapiStore = () => {
    const {app: appConfig} = getConfig()
    const apiConfig = {
        ...appConfig.commerceAPI
    }
    const [error, setError] = useState()
    const [isLoading, setIsLoading] = useState(true)
    const {getTokenWhenReady} = useAccessToken()
    const proxy = `/mobify/proxy/ocapi`
    const host = `${getAppOrigin()}${proxy}`

    // Fetch all stores or local stores if passed lat, long, dist
    const fetchStore = async (storeId) => {
        const token = await getTokenWhenReady()

        const headers = {
            'Content-Type': 'application/json',
            'x-dw-client-id': apiConfig.parameters.clientId,
            authorization: `Bearer ${token}`
        }

        try {
            const response = await fetch(
                `${host}/s/${apiConfig.parameters.siteId}/dw/shop/v21_3/stores/${storeId}`,
                {
                    method: 'GET',
                    headers: headers
                }
            )
            const responseJson = await response.json()
            const resStore = keysToCamel(responseJson)

            return resStore
        } catch (e) {
            console.warn(`GET store request failed with error: ${e}`)
            setError(e)
        } finally {
            setIsLoading(false)
        }
    }

    return {isLoading, error, fetchStore}
}
