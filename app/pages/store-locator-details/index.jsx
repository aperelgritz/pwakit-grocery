import React, {useState, useEffect} from 'react'
import PropTypes from 'prop-types'

import {useHistory, useParams} from 'react-router-dom'

// Site and locale hook
import useMultiSite from '@salesforce/retail-react-app/app/hooks/use-multi-site'

// Utils
import Link from '../../components/link'

// Components
import {
    Box,
    Flex,
    Stack,
    Container,
    Heading,
    Center,
    Button
} from '@salesforce/retail-react-app/app/components/shared/ui'

// Project Components
import Seo from '../../components/seo'
import StoreMap from '../../components/store-locator/store-map-wrapper'
import StoreServiceTile from '../../components/store-locator/store-service-tile'
import StoreImage from '../../components/store-locator/store-image'
import StoreDetailsInfo from '../../components/store-locator/store-details-info'
import StoreBreadCrumb from '../../components/store-locator/store-breadcrumb'

// Constants
import {GOOGLE_MAPS_API_KEY} from '../../../config/storelocator'

// React Context
import {ClickStoreContext} from '../store-locator'

// Translations
import {useIntl} from 'react-intl'

// Alexis custom
import {useStoreDetails} from '../../commerce-api/use-ocapi-store-details'

/**
 * This is the store locator details page for Retail React App.
 */
const StoreLocatorDetails = () => {
    //Instantiate resource object
    const intl = useIntl()

    // Alexis custom
    const {storeId} = useParams()
    const [store, setStore] = useState('')
    const {isLoading, error, fetchStoreDetails} = useStoreDetails(setStore)

    useEffect(() => {
        const storeRes = fetchStoreDetails(storeId)
        setStore(storeRes)
    }, [])

    if (store) {
        /* SEND AND RECEIVE MESSAGES */
        if (typeof window !== 'undefined') {
            try {
                // Called from the iframe
                const message = JSON.stringify({
                    message: 'Hello from iframe',
                    date: Date.now(),
                    store: store.id
                })

                window.parent.postMessage(message, '*')
            } catch (e) {
                console.log(e)
            }
        }
    }

    // update store when user goes back in history
    const history = useHistory()
    // Alexis custom - extract buildUrl provided in newer useMultiSite hook
    //const {site, locale} = useMultiSite()
    const {site, locale, buildUrl} = useMultiSite()
    // const configValues = {
    //     locale: locale.alias || locale.id,
    //     site: site.alias || site.id
    // }
    let backListener = history.listen((location) => {
        if (location.action === 'POP') {
            //const path = buildPathWithUrlConfig('/stores', configValues)
            const path = buildUrl('/stores')
            history.push(path)
        }
    })

    const [storeClickID, setStoreClickID] = useState('')

    // Creation of the marker
    let mapPin
    if (store) {
        mapPin = [
            {
                id: store.id,
                latitude: store.latitude,
                longitude: store.longitude,
                name: store.name,
                address: store.address1,
                clickable: false,
                unique: true,
                storePinSVG: store.c_storePinSVG,
                phone: store.phone,
                hours: store.store_hours
            }
        ]
    }

    /**
     * @function goBackButton
     * @description Go Back Button component
     * @returns Go back button
     */
    const goBackButton = () => {
        const STORES_HREF = '/stores'
        return (
            <>
                <Box paddingBottom={'15px'} paddingTop={'15px'} width={'100%'}>
                    <Link to={STORES_HREF}>
                        <Button
                            colorScheme="blue"
                            variant="solid"
                            width={{base: '30%', lg: '15%'}}
                            fontSize={'14px'}
                            lineHeight={'21px'}
                            fontWeight={'700'}
                            borderRadius={'4px'}
                            id="js-back-button"
                        >
                            {intl.formatMessage({
                                defaultMessage: 'Return',
                                id: 'storelocator.details.return'
                            })}
                        </Button>
                    </Link>
                </Box>
            </>
        )
    }

    /**
     * @function checkStore
     * @description Store details creation
     * @returns Container with a message saying that the store or container is being loaded with the store details
     */
    const checkStore = () => {
        if (store) {
            // no store found
            if (store.hasOwnProperty('fault')) {
                return (
                    <>
                        <StoreBreadCrumb home={false} storeName={''}></StoreBreadCrumb>
                        <Center paddingY={'30px'}>
                            <Heading>
                                {intl.formatMessage({
                                    defaultMessage: 'Store Not Found',
                                    id: 'storelocator.storedetails.notfound'
                                })}
                            </Heading>
                        </Center>
                    </>
                )
            } else {
                return (
                    <ClickStoreContext.Provider value={[storeClickID, setStoreClickID]}>
                        <Seo
                            title={store.name}
                            description={store.name}
                            noIndex={undefined}
                            children={undefined}
                        />
                        <Container maxHeight={'auto'} backgroundColor={'w'}>
                            <StoreBreadCrumb home={false} storeName={store.name}></StoreBreadCrumb>
                            <Heading
                                fontSize={'24px'}
                                lineHeight={'36px'}
                                fontWeight={'700'}
                                paddingBottom={{base: '0px', lg: '32px'}}
                            >
                                {store.name}
                            </Heading>
                            <Stack
                                align={'center'}
                                spacing={{base: 8, md: 10}}
                                width={'100%'}
                                display={'flex'}
                                direction={{base: 'column', md: 'row'}}
                                minHeight={{base: 'auto', md: '530px', lg: '650px'}}
                            >
                                <Flex
                                    display={{base: 'contents', md: 'flex'}}
                                    flex={1}
                                    direction={{base: 'column', md: 'column'}}
                                    minHeight={{base: 'auto', md: '490px', lg: '500px'}}
                                    width={{base: '100%', lg: '344px'}}
                                    marginBottom={36}
                                >
                                    {goBackButton()}
                                    {store.image && (
                                        <Flex
                                            flex={1}
                                            spacing={{base: 5, md: 10}}
                                            flexGrow={1}
                                            direction={{base: 'column', md: 'column'}}
                                            width={'100%'}
                                            order={{base: 1, md: 1}}
                                        >
                                            <StoreImage
                                                image={store.image}
                                                alt={store.name}
                                            ></StoreImage>
                                        </Flex>
                                    )}
                                    <Flex
                                        flex={1}
                                        spacing={{base: 5, md: 10}}
                                        flexGrow={1}
                                        direction={{base: 'column', md: 'column'}}
                                        width={'100%'}
                                        order={{base: 2, md: 2}}
                                        maxHeight={'275px'}
                                    >
                                        {/* Store Directions */}
                                        <StoreDetailsInfo
                                            id={store.id}
                                            name={store.name}
                                            phone={store.phone}
                                            address1={store.address1}
                                            latitude={store.latitude}
                                            longitude={store.longitude}
                                            addressLine={store.address1}
                                            state={store.state}
                                            postal_code={store.postalCode}
                                            city={store.city}
                                            store_hours={store.store_hours}
                                            c_storePinSVG={''}
                                            c_services={store.c_services}
                                            email={store.email}
                                        ></StoreDetailsInfo>
                                    </Flex>
                                </Flex>
                                <Flex
                                    display={'flex'}
                                    flex={1}
                                    justify={'center'}
                                    align={'center'}
                                    position={'relative'}
                                    width={'100%'}
                                    minHeight={{base: 'auto', md: '530px', lg: '650px'}}
                                    direction={{base: 'row', md: 'column'}}
                                    order={{base: 2, md: 3}}
                                    paddingBottom={{sm: '30px', lg: '0px'}}
                                    paddingTop={{base: '0px', sm: '15px', md: '0px', lg: '0px'}}
                                    textAlign={'center'}
                                >
                                    <StoreMap pins={mapPin} apiKey={GOOGLE_MAPS_API_KEY}></StoreMap>
                                </Flex>
                            </Stack>
                            {/* Stores Service */}
                            {store.image && (
                                <Box
                                    width={'100%'}
                                    paddingTop={{base: '30px', md: '30px', lg: '60px'}}
                                >
                                    <StoreServiceTile
                                        contentAssetBody={store.contentAssetBody}
                                        contentAssetName={store.contentAssetName}
                                    ></StoreServiceTile>
                                </Box>
                            )}
                        </Container>
                    </ClickStoreContext.Provider>
                )
            }
        } else {
            return (
                <>
                    <StoreBreadCrumb home={false} storeName={''}></StoreBreadCrumb>
                    <Center paddingY={'30px'}>
                        <Heading>
                            {intl.formatMessage({
                                defaultMessage: ' Loading Store...',
                                id: 'storelocator.storedetails.loading'
                            })}
                        </Heading>
                    </Center>
                </>
            )
        }
    }

    return (
        <Box data-testid="home-page" layerStyle="page" paddingBottom="100px">
            {checkStore()}
        </Box>
    )
}

StoreLocatorDetails.getTemplateName = () => 'store-locator-details'

// StoreLocatorDetails.shouldGetProps = ({previousLocation, location}) =>
//     !previousLocation || previousLocation.pathname !== location.pathname

// StoreLocatorDetails.getProps = async ({res, params, location, api}) => {
//     const {storeId} = params
//     if (res) {
//         res.set('Cache-Control', 'max-age=900')
//     }
//     let store = await api.shopperStores.getStore({storeId: storeId})
//     return {store}
// }

StoreLocatorDetails.propTypes = {
    store: PropTypes.object
}

export default StoreLocatorDetails
