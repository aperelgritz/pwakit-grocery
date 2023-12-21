import React, {useEffect, useState, useMemo} from 'react'
import PropTypes from 'prop-types'
// Alexis custom
import {motion} from 'framer-motion'

// Components
import {
    Box,
    Flex,
    Stack,
    Container,
    Spinner
} from '@salesforce/retail-react-app/app/components/shared/ui'

// Project Components
import Seo from '../../components/seo'
import StoreCard from '../../components/store-locator/store-card/index.jsx'
import StoreSearch from '../../components/store-locator/store-search/index.jsx'
import StoreMapWrapper from '../../components/store-locator/store-map-wrapper/index.jsx'
import StoreBreadCrumb from '../../components/store-locator/store-breadcrumb/index.jsx'

// Constants
import {GOOGLE_MAPS_API_KEY} from '../../../config/storelocator'

// Configurations
import Fuse from 'fuse.js'
import {options} from '../../utils/store-locator/fuse.config'

// Alexis custom grocery
import {useOcapiStores} from '../../commerce-api/use-ocapi-stores'
import {isServer} from '@salesforce/retail-react-app/app/utils/utils'

// React Context
export const ClickStoreContext = React.createContext([])

/**
 * This is the store locator page for Retail React App.
 */
const StoreLocator = () => {
    const [stores, setStores] = useState([])
    // Alexis custom - start
    const {isLoading, error: useStoresAllError, fetchStores} = useOcapiStores(setStores)
    // Alexis custom - end

    // array of stores that are being manipulated by the user hook
    const [allStores, setAllStores] = useState()
    // cached stores hook
    const [originalStores, setOriginalStores] = useState()
    // search input hook
    const [searchInput, setSearchInput] = useState('')
    const [arrayLength, setArrayLength] = useState(false)
    const [numberOfStores, setNumberOfStores] = useState(0)
    const [numberOfStoresNearMe, setnumberOfStoresNearMe] = useState(0)
    const [storeClickID, setStoreClickID] = useState('')
    // Loading spinner hook
    const [debounceLoading, setDebounceLoading] = useState(true)
    const [mapPins, setMapPins] = useState([])

    // Alexis custom - start
    // Get all stores
    useEffect(() => {
        fetchStores()
    }, [])

    // Retrieve original stores from local storage
    if (!isServer && !originalStores) {
        const storesInLocalStorage = JSON.parse(window.localStorage.getItem('originalStores'))
        if (storesInLocalStorage) {
            setOriginalStores(storesInLocalStorage)
        }
    }

    useEffect(() => {
        setAllStores(stores)
        let pins = buildMapPins(stores)
        setMapPins(pins)
        if (stores) {
            setDebounceLoading(false)
        }
    }, [JSON.stringify(stores)])
    // Alexis custom - end

    // update store when user goes back in history
    // useEffect(() => {
    //     if (!originalStores) {
    //         if (stores != null) {
    //             setOriginalStores(stores)
    //             setAllStores(stores)
    //             let pins = buildMapPins(stores)
    //             setMapPins(pins)
    //         }
    //     }

    //     if (stores) {
    //         setDebounceLoading(false)
    //     }
    // }, [stores])

    /* SEND AND RECEIVE MESSAGES */
    if (typeof window !== 'undefined') {
        window.addEventListener('message', function (e) {
            try {
                const data = JSON.parse(e.data)
                if (data.source === 'SFCC' && data.token === 'token') {
                    document.querySelector('footer').style = 'display: none'
                    document.getElementById('header-class').style = 'display: none'
                }
            } catch (e) {
                //console.log(e)
            }
        })
    }

    /**
     * @function buildMapPins
     * @description Function that creates the markers that appear on the map
     * @param stores Array -> Array of stores
     * @returns Array -> Array of Pins(markers)
     */
    const buildMapPins = (stores) => {
        if (stores) {
            let pins = stores.map((store) => {
                return {
                    id: store.id,
                    latitude: store.latitude,
                    longitude: store.longitude,
                    name: store.name,
                    address: store.address1,
                    clickable: true,
                    unique: false,
                    storePinSVG: store.c_storePinSVG,
                    phone: store.phone,
                    hours: store.store_hours
                }
            })
            return pins
        }
    }

    // Creating the markers for the first load
    // let pins = buildMapPins(stores)
    // const [mapPins, setMapPins] = useState(pins)

    /**
     * @function handleStoreEmpty
     * @description Function that resets the original stores (which are cached) when the search is empty
     */
    const handleStoreEmpty = async () => {
        let pins = buildMapPins(originalStores)
        setMapPins(pins)
        setAllStores(originalStores)
        numberStoresFound(0, originalStores)
        setSearchInput('')
        handleStoreArray(false)
        setnumberOfStoresNearMe(0)
        setStoresArrayLength(allStores?.length)
        moveListToTop()
    }

    /**
     * @function handleStoreSearch
     * @description Function that filters the stores according to the search performed
     * @param input string -> Search Term
     */
    const handleStoreSearch = async (input) => {
        if (input != null) {
            // Alexis custom - rename setStores to avoid conflict with state update function
            // var setStores = stores || []
            var storesForFuse = originalStores || []
            setDebounceLoading(true)
            // const fuse = new Fuse(setStores, options)
            const fuse = new Fuse(storesForFuse, options)
            let filteredStores = fuse.search(input)

            let auxFilteredStores = []

            // Fuse returns an object. Inside this object we have the array with the stores found. We have to extract this array from the returned object
            filteredStores.map((x) => auxFilteredStores.push(x.item))

            // for google maps api
            // @ts-ignore
            let placesService = new google.maps.places.PlacesService(document.createElement('div')) //empty element. just to instantiate

            const request = {
                query: input
            }

            // call google places  API
            let responseObject = await placesService.textSearch(
                request,
                async function (results, status) {
                    // for google maps api
                    // @ts-ignore
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        // get the first element(lat and lng props) of the results returned from google maps (the first element will be the most accurate)
                        let lagLongobj = {
                            lat: results[0].geometry.location.lat(),
                            lng: results[0].geometry.location.lng()
                        }

                        // Alexis custom start
                        const storesNear = await fetchStores(lagLongobj.lat, lagLongobj.lng, '100')
                        // Calls OCAPI with the lat and lng of the most relevant element found from Google Maps
                        // let storesNear = useStoresNear({
                        //     lat: lagLongobj.lat,
                        //     long: lagLongobj.lng
                        // })
                        // Alexis custom end

                        let auxStores = auxFilteredStores
                        // Alexis custom start
                        // concat the stores returned from Fuse and OCAPI
                        if (Array.isArray(storesNear) && storesNear.length > 0) {
                            auxStores = auxStores.concat(storesNear)
                        }
                        // auxStores = auxStores.concat(storesNear)
                        // Alexis custom end

                        // remove duplicate stores from array
                        auxStores = Array.from(new Set(auxStores.map((a) => a.id))).map((id) => {
                            return auxStores.find((a) => a.id === id)
                        })

                        let pins = buildMapPins(auxStores)
                        setMapPins(pins)
                        numberStoresFound(auxStores.length, auxStores)
                        setAllStores(auxStores)
                        // Alexis custom - added setStores, otherwise gets cleares and triggers useEffect which clears allStores
                        setStores(auxStores)
                        setnumberOfStoresNearMe(0)
                        setStoresArrayLength(auxStores.length)
                        setDebounceLoading(false)
                    } else {
                        let pins = buildMapPins(auxFilteredStores)
                        setMapPins(pins)
                        numberStoresFound(auxFilteredStores.length, auxFilteredStores)
                        setAllStores(auxFilteredStores)
                        setnumberOfStoresNearMe(0)
                        setStoresArrayLength(auxFilteredStores.length)
                        setDebounceLoading(false)
                    }
                }
            )
            moveListToTop()
        } else {
            setDebounceLoading(true)
            setSearchInput('')
            let pins = buildMapPins(originalStores)
            setMapPins(pins)
            numberStoresFound(0, originalStores)
            setAllStores(originalStores)
            setStoresArrayLength(allStores.length)
            setDebounceLoading(false)
            moveListToTop()
        }
    }

    /**
     * @function setStoresArrayLength
     * @description Set number of stores
     * @param input Number -> Stores array lenght
     */
    const setStoresArrayLength = (length) => {
        if (length > 0) {
            handleStoreArray(false)
        } else {
            handleStoreArray(true)
        }
    }

    /**
     * @function moveListToTop
     * @description Move div of stores to the top
     */
    const moveListToTop = () => {
        let storeList = document.getElementById('store-list')
        if (storeList) {
            let firstChild = storeList.firstElementChild
            firstChild.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'start'})
        }
    }

    /**
     * @function handleStoreArray
     * @description Function that applies the gray background if there are no search results
     */
    const handleStoreArray = (input) => {
        setArrayLength(input)
    }

    /**
     * @function getStoresByUserLocation
     * @description Function that searches for stores near to the user's location
     */
    const getStoresByUserLocation = () => {
        navigator.geolocation.getCurrentPosition(getUserCoords, error)
    }

    /**
     * @function error
     * @description when the user denied access to geolocation
     */
    const error = (err) => {
        // TODO
        // User denied Geolocation
        console.log(err)
    }

    /**
     * @function getUserCoords
     * @description Obtain user coordinates after user allows access to geolocation
     */
    const getUserCoords = async (pos) => {
        if (pos) {
            setDebounceLoading(true)
            // Alexis custom
            let stores = (await fetchStores(pos.coords.latitude, pos.coords.longitude, '100')) || []
            // let stores =
            //     (await fetchStores({
            //         lat: pos.coords.latitude,
            //         long: pos.coords.longitude
            //     })) || []
            if (stores.length) {
                let pins = buildMapPins(stores)
                setnumberOfStoresNearMe(stores.length)
                setMapPins(pins)
                setAllStores(stores)
                numberStoresFound(0, stores)
                setSearchInput('')
                handleStoreArray(false)
            } else {
                setnumberOfStoresNearMe(-1)
                setMapPins([])
                setAllStores([])
                numberStoresFound(0, [])
                setSearchInput('')
                handleStoreArray(false)
            }
            setDebounceLoading(false)
        }
    }

    /**
     * @function numberStoresFound
     * @description Function that determines the number of stores resulting from the search
     */
    const numberStoresFound = (number, stores) => {
        setAllStores(stores)
        stores?.length === 0 ? setNumberOfStores(-1) : setNumberOfStores(number)
    }

    return (
        <Box data-testid="home-page" layerStyle="page" paddingBottom="50px">
            <Seo
                title="Store Locator"
                description="Store Locator"
                noIndex={undefined}
                children={undefined}
            />
            <ClickStoreContext.Provider value={[storeClickID, setStoreClickID]}>
                <Container maxHeight={{lg: '772px'}} backgroundColor={'w'}>
                    <StoreBreadCrumb home={true} storeName={''}></StoreBreadCrumb>
                    <Stack
                        align={'center'}
                        spacing={{base: 8, md: 10}}
                        width={'100%'}
                        display={'flex'}
                        direction={{base: 'column', lg: 'row'}}
                        minHeight={'650px'}
                    >
                        <Flex
                            display={{base: 'contents', lg: 'flex'}}
                            flex={1}
                            direction={{base: 'column', md: 'column'}}
                            width={{base: '100%', lg: '448px'}}
                            minHeight={'650px'}
                            position={'relative'}
                        >
                            <Flex
                                flex={1}
                                spacing={{base: 5, md: 10}}
                                flexGrow={1}
                                direction={{base: 'column', md: 'column'}}
                                width={'100%'}
                                order={{base: 1, sm: 1, md: 1}}
                            >
                                <StoreSearch
                                    handleStoreSearch={handleStoreSearch}
                                    numberOfStores={numberOfStores}
                                    getStoresByUserLocation={getStoresByUserLocation}
                                    numberOfStoresNearMe={numberOfStoresNearMe}
                                    handleStoreEmpty={handleStoreEmpty}
                                ></StoreSearch>
                            </Flex>
                            <Flex
                                flex={1}
                                spacing={{base: 5, md: 10}}
                                flexGrow={1}
                                direction={{base: 'column', md: 'column'}}
                                width={'100%'}
                                order={{base: allStores && allStores.length > 0 ? 3 : 2, lg: 2}}
                                paddingTop={{base: '32px', lg: '0px'}}
                            >
                                {debounceLoading === true ? (
                                    <Box textAlign={'center'}>
                                        <Spinner
                                            thickness="4px"
                                            speed="0.65s"
                                            emptyColor="gray.200"
                                            color="blue.500"
                                            size="xl"
                                        />
                                    </Box>
                                ) : (
                                    // Alexis custom - added motion.div for animations
                                    <motion.div
                                        initial={{opacity: 0, y: 100}}
                                        animate={{opacity: 1, y: 0}}
                                        exit={{opacity: 0}}
                                    >
                                        <StoreCard
                                            searchTerm={searchInput}
                                            handleStoreArray={handleStoreArray}
                                            numberStoresFound={numberStoresFound}
                                            stores={allStores}
                                        ></StoreCard>
                                    </motion.div>
                                )}
                            </Flex>
                        </Flex>

                        <Flex
                            display={'flex'}
                            flex={1}
                            justify={'center'}
                            align={'center'}
                            position={'relative'}
                            width={'100%'}
                            minHeight={'650px'}
                            direction={{base: 'row', md: 'column'}}
                            order={{base: 2, lg: 3}}
                            paddingBottom={{sm: '30px', lg: '0px'}}
                            textAlign={'center'}
                            marginTop={{
                                base: allStores && allStores.length > 0 ? '' : '30px',
                                md: allStores && allStores.length > 0 ? '' : '0px !important',
                                lg: allStores && allStores.length > 0 ? '' : '30px'
                            }}
                        >
                            {mapPins?.length > 0 && (
                                <StoreMapWrapper
                                    pins={mapPins}
                                    apiKey={GOOGLE_MAPS_API_KEY}
                                ></StoreMapWrapper>
                            )}
                        </Flex>
                    </Stack>
                </Container>
            </ClickStoreContext.Provider>
        </Box>
    )
}

StoreLocator.getTemplateName = () => 'store-locator'

StoreLocator.propTypes = {
    stores: PropTypes.oneOfType([PropTypes.object, PropTypes.array])
}

export default StoreLocator
