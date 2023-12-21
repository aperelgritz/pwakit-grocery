import React, {useState, useEffect, useCallback} from 'react'
import fetch from 'cross-fetch'

import {getConfig} from '@salesforce/pwa-kit-runtime/utils/ssr-config'
import {getAppOrigin} from '@salesforce/pwa-kit-react-sdk/utils/url'
import {keysToCamel} from '@salesforce/retail-react-app/app/utils/utils'
import {useAccessToken} from '@salesforce/commerce-sdk-react'

const StoresDummy = () => {
    const [stores, setStores] = useState('')
    const {getTokenWhenReady} = useAccessToken()
    const {app: appConfig} = getConfig()
    const apiConfig = {
        ...appConfig.commerceAPI
    }

    console.log('apiConfig:', apiConfig)

    const fetchNearStores = useCallback(async () => {
        const token = await getTokenWhenReady()
        const proxy = `/mobify/proxy/ocapi`
        const host = `${getAppOrigin()}${proxy}`

        const headers = {
            'Content-Type': 'application/json',
            'x-dw-client-id': apiConfig.parameters.clientId,
            authorization: `Bearer ${token}`
        }

        let response
        try {
            response = await fetch(
                `${host}/s/${apiConfig.parameters.siteId}/dw/shop/v21_3/stores?latitude=50.653439&longitude=5.529859`,
                {
                    method: 'GET',
                    headers: headers
                }
            )
        } catch (e) {
            console.warn(`Stores request failed with error: ${e}`)
        }

        if (!response?.ok) {
            return {}
        }

        const responseJson = await response.json()

        setStores(responseJson)
    }, [])

    useEffect(() => {
        fetchNearStores()
    }, [])

    return (
        <div>
            <p>My dummy stores:</p>
            <p>{JSON.stringify(stores)}</p>
        </div>
    )
}

export default StoresDummy
