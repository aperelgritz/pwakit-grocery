// Alexis custom hook - keep store app context & api context in sync
import {useContext, useEffect, useCallback, useState} from 'react'

import {useCommerceApi, useAccessToken, useUsid} from '@salesforce/commerce-sdk-react'
import {getConfig} from '@salesforce/pwa-kit-runtime/utils/ssr-config'
import {isServer} from '@salesforce/retail-react-app/app/utils/utils'

import {StoreContext} from '../contexts'
import {useOcapiStore} from '../commerce-api/use-ocapi-store'

/**
 * Custom React hook to get the selected store
 * @returns {{store: string, setStore: function, reservedSlot: object, setReservedSlot: function, isLoading: boolean}[]}
 */
export const useStore = () => {
    const {app: appConfig} = getConfig()

    const apiConfig = {
        ...appConfig.commerceAPI
    }

    const context = useContext(StoreContext)
    const [fetchedContext, setFetchedContext] = useState()
    const {fetchStore} = useOcapiStore()
    const api = useCommerceApi()
    const {getTokenWhenReady} = useAccessToken()
    const {getUsidWhenReady} = useUsid()

    if (context === undefined) {
        throw new Error('useStore must be used within StoreProvider')
    }

    // fetch shopper context, set fetchedContext component state
    const fetchShopperContext = useCallback(async () => {
        context.setIsLoading(true)
        const token = await getTokenWhenReady()
        const usid = await getUsidWhenReady()
        let resGetCtxt

        try {
            resGetCtxt = await api.shopperContexts.getShopperContext({
                parameters: {usid, siteId: apiConfig.parameters.siteId},
                headers: {Authorization: `Bearer ${token}`}
            })

            if (resGetCtxt) {
                setFetchedContext(resGetCtxt)
            }

            context.setIsLoading(false)
        } catch (e) {
            console.error(e)
        }

        // Shopper context doesn't exist - create new empty context
        if (!resGetCtxt) {
            context.setIsLoading(true)
            try {
                await api.shopperContexts.createShopperContext({
                    parameters: {usid, siteId: apiConfig.parameters.siteId},
                    headers: {Authorization: `Bearer ${token}`},
                    body: {
                        assignmentQualifiers: {
                            STORE: ''
                        }
                    }
                })

                context.setIsLoading(false)
            } catch (e) {
                console.error(e)
                context.setIsLoading(false)
                return context
            }
        }
    }, [])

    // fetch store detauks, set newContext state
    const fetchStoreDetails = useCallback(async (storeId) => {
        context.setIsLoading(true)
        const fetchedStore = await fetchStore(storeId)
        if (fetchedStore) {
            context.setStore(fetchedStore)
        }
        context.setIsLoading(false)
    }, [])

    // Alexis custom - get reserved timeslot from local storage
    const checkReservationInLocalStorage = useCallback(() => {
        if (!isServer) {
            const localStorageReservation = localStorage.getItem('ts_manager_res')
            if (localStorageReservation) {
                const reservationObj = JSON.parse(localStorageReservation)
                const reservationExpiry = reservationObj.reservationExpiry
                if (new Date() > new Date(reservationExpiry)) {
                    localStorage.setItem('ts_manager_res', '')
                } else {
                    context.setReservedSlot(reservationObj)
                }
            }
        }
    }, [])

    // fetch shopper context from api and set local state
    useEffect(() => {
        fetchShopperContext()
    }, [fetchShopperContext])

    // fetch store details when context is returned, and set local state
    useEffect(() => {
        if (fetchedContext?.assignmentQualifiers?.STORE) {
            fetchStoreDetails(fetchedContext.assignmentQualifiers.STORE)
        }
    }, [fetchedContext, fetchStoreDetails])

    // if no reserved slot in context, check local storage
    useEffect(() => {
        if (!context.reservedSlot) {
            checkReservationInLocalStorage()
        }
    }, [context.reservedSlot, checkReservationInLocalStorage])

    // store already in app context, no need to fetch again
    if (context.store) {
        return context
    }

    return context
}
