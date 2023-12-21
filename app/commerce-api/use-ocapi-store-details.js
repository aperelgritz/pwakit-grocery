// Alexis custom
import {useState} from 'react'

import fetch from 'cross-fetch'

import {getConfig} from '@salesforce/pwa-kit-runtime/utils/ssr-config'
import {getAppOrigin} from '@salesforce/pwa-kit-react-sdk/utils/url'
import {keysToCamel} from '@salesforce/retail-react-app/app/utils/utils'
import {useAccessToken} from '@salesforce/commerce-sdk-react'

const {app: appConfig} = getConfig()
const apiConfig = {
    ...appConfig.commerceAPI
}

// Hook returns fetching function, which sets store in state and also returns stores JSON
export const useStoreDetails = (setStores) => {
    const [error, setError] = useState()
    const [isLoading, setIsLoading] = useState(true)
    const {getTokenWhenReady} = useAccessToken()
    const proxy = `/mobify/proxy/ocapi`
    const host = `${getAppOrigin()}${proxy}`

    // Fetch store detail
    const fetchStoreDetails = async (storeId) => {
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
            const resStores = keysToCamel(responseJson.data)
            console.log('resStores:', resStores)
            setStores(resStores)
            return resStores
        } catch (e) {
            console.warn(`GET all stores request failed with error: ${e}`)
            setError(e)
        } finally {
            setIsLoading(false)
        }
    }

    return {isLoading, error, fetchStoreDetails}
}
