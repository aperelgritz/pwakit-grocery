// Google Import
import {loadGoogleMapApi} from '../../../utils/store-locator/LoadGoogleMapApi'

// Components
import {Box, Heading} from '@chakra-ui/react'

// React Imports
import React, {useEffect, useState} from 'react'
// Alexis custom
import {motion} from 'framer-motion'

// Project Components
import Map from '../store-map'

// Translations
import {useIntl} from 'react-intl'

/**
 * Store Map Wrapper component used on stores page and store details page.
 */
const StoreMapWrapper = ({apiKey, pins}) => {
    //Instantiate resource object
    const intl = useIntl()

    const [mapScriptLoaded, SetMapScriptLoaded] = useState(false)

    useEffect(() => {
        const googleMapScript = loadGoogleMapApi(apiKey)
        // for google maps api
        // @ts-ignore
        if (window.google) {
            SetMapScriptLoaded(true)
        }

        googleMapScript.addEventListener('load', function () {
            SetMapScriptLoaded(true)
        })
    }, [apiKey])

    return (
        <>
            <Box
                position={'relative'}
                rounded={'2xl'}
                boxShadow={'2xl'}
                width={'full'}
                overflow={'hidden'}
            >
                {mapScriptLoaded && pins ? (
                    <Map pins={pins} />
                ) : (
                    <Box top={'35%'} position={'relative'}>
                        <Heading>
                            {intl.formatMessage({
                                defaultMessage: 'Loading Map...',
                                id: 'storelocator.map.loading'
                            })}
                        </Heading>
                    </Box>
                )}
            </Box>
        </>
    )
}

export default StoreMapWrapper
