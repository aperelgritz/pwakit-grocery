// React Imports
import React, {useContext, useEffect, useState, useCallback} from 'react'
import {Link} from 'react-router-dom'

// Components
import {
    Box,
    Text,
    Input,
    Heading,
    ListItem,
    Img,
    Button,
    HStack,
    // Alexis custom
    Spinner,
    VStack,
    Skeleton
} from '@salesforce/retail-react-app/app/components/shared/ui'

// Alexis custom
import {UnorderedList} from '@chakra-ui/react'
import {BsEmojiNeutral} from 'react-icons/bs'
import {SlLocationPin} from 'react-icons/sl'
import {SlClock} from 'react-icons/sl'

// React Context
import {ClickStoreContext} from '../../../pages/store-locator'

// Translations
import {useIntl, FormattedMessage} from 'react-intl'

import {getAssetUrl} from '@salesforce/pwa-kit-react-sdk/ssr/universal/utils'
import LocaleSelector from '../../locale-selector'

// Alexis custom - store context
import {useStore} from '../../../hooks/use-store'
import {useShopperContextsMutation, useUsid} from '@salesforce/commerce-sdk-react'
import useTimeslotMgr from '@salesforce/retail-react-app/app/commerce-api/use-timeslot-manager'
import {getConfig} from '@salesforce/pwa-kit-runtime/utils/ssr-config'
import {isServer} from '@salesforce/retail-react-app/app/utils/utils'

// Alexis custom - user-friendly dates
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

/**
 * Store Information Component used on stores page.
 * Here a list of all stores is built from the data returned from the API
 */
const StoreInformationComponent = (props) => {
    //Instantiate resource object
    const intl = useIntl()

    const [val, setVal] = useContext(ClickStoreContext)
    const [storeActive, setStoreActive] = useState('')

    // Alexis custom - track stores in state to update with slots
    const [stores, setStores] = useState(props.stores)
    const [isSlotLoading, setIsSlotLoading] = useState(false)

    // Alexis custom - select store for inventory
    const {
        store: selectedStore,
        setStore: setSelectedStore,
        reservedSlot,
        setReservedSlot
    } = useStore()

    // Alexis custom - get mutate function and usid for shopper-context
    const {getUsidWhenReady} = useUsid()
    const {
        app: {
            commerceAPI: {
                parameters: {siteId}
            }
        }
    } = getConfig()
    const updateShopperContext = useShopperContextsMutation('updateShopperContext')

    // Alexis custom - get timeslot manager functions
    const {timeslotMgrSearchFirstSlots, timeslotMgrSoftReserve, timeslotMgrCancelReserve} =
        useTimeslotMgr()

    /**
     * @function storeClick
     * @description saves the store ID that is clicked
     */
    const storeClick = (id) => {
        setVal(id)
    }

    useEffect(() => {
        if (val !== storeActive) {
            let oldStore = document.getElementById(storeActive)

            if (oldStore) {
                // @ts-ignore
                oldStore.style.borderColor = '#C9C9C9'
            }

            let store = document.getElementById(val)

            if (store) {
                // scroll to element
                const onScroll = () => {
                    const parent = document.getElementById('store-wrapper')

                    const relativeTop =
                        window.scrollY > parent.offsetTop ? window.scrollY : parent.offsetTop

                    parent.scrollTo({
                        behavior: 'smooth',
                        top: store.offsetTop - relativeTop
                    })
                }

                window.removeEventListener('scroll', onScroll)
                window.addEventListener('scroll', onScroll)
                onScroll()

                // @ts-ignore
                store.style.borderColor = '#0176D3'
                // in the end, remove again event listener
                window.removeEventListener('scroll', onScroll)
            }

            setStoreActive(val)
        }
    }, [val])

    // Alexis custom - fetch and update state
    const fetchSlotsAndUpdateState = useCallback(async () => {
        setIsSlotLoading(true)
        let storesWithNextSlot = []

        for (const store of props.stores) {
            if (store.c_facilityId) {
                const slots = await timeslotMgrSearchFirstSlots(store.c_facilityId)

                if (slots.length > 0) {
                    storesWithNextSlot.push({
                        ...store,
                        nextSlot: {
                            ...slots[0] // keep only the first available slot
                        }
                    })
                } else {
                    storesWithNextSlot.push({
                        ...store
                    })
                }
            } else {
                storesWithNextSlot.push({
                    ...store
                })
            }
        }

        setStores(storesWithNextSlot)
        setIsSlotLoading(false)
    }, [])

    // Alexis custom
    useEffect(() => {
        fetchSlotsAndUpdateState()
    }, [fetchSlotsAndUpdateState])

    /**
     * @function storeAddress
     * @description Function to build the address line depending if state exists in address
     * @returns String with store address
     */
    function storeAddress(address1, city, state, postal_code) {
        if (state) {
            return `${intl.formatMessage({
                defaultMessage: 'Address: ',
                id: 'storelocator.storeinfo.address'
            })} ${address1}, ${city}, ${state}, ${postal_code}`
        } else {
            return `${intl.formatMessage({
                defaultMessage: 'Address: ',
                id: 'storelocator.storeinfo.address'
            })} ${address1}, ${city}, ${postal_code}`
        }
    }

    /**
     * @function buildStore
     * @description Function that builds a list of stores
     * @returns list of stores
     */
    const buildStore = () => {
        let stores = props.stores
    }

    // Alexis custom - select store for inventory
    const selectStoreHandler = async (store) => {
        const usid = await getUsidWhenReady()
        await updateShopperContext.mutate({
            parameters: {usid, siteId},
            body: {
                assignmentQualifiers: {
                    STORE: store.id
                }
            }
        })

        setSelectedStore(store)
    }

    // Alexis custom - unselect store
    const unselectStoreHandler = async () => {
        const usid = await getUsidWhenReady()
        await updateShopperContext.mutate({
            parameters: {usid, siteId},
            body: {
                assignmentQualifiers: {
                    STORE: ''
                }
            }
        })

        setSelectedStore({})
    }

    // Alexis custom - Soft reserve slot
    const softReserveHandler = async (store) => {
        const softReservation = await timeslotMgrSoftReserve(store.nextSlot.uuid)

        if (softReservation) {
            setReservedSlot(softReservation)
        }

        const usid = await getUsidWhenReady()
        await updateShopperContext.mutate({
            parameters: {usid, siteId},
            body: {
                assignmentQualifiers: {
                    STORE: store.id
                }
            }
        })

        setSelectedStore(store)
    }

    // Alexis custom - Soft reserve slot
    const cancelAndSoftReserveHandler = async (store) => {
        // Cancel reserved slot
        const cancelRes = await timeslotMgrCancelReserve(reservedSlot.reservationId)

        // If cancellation is confirmed, soft reserve the selected slot and set store in context
        if (cancelRes.status === 'CANCELLED') {
            const softReservation = await timeslotMgrSoftReserve(store.nextSlot.uuid)
            if (softReservation) {
                setReservedSlot(softReservation)
            }

            const usid = await getUsidWhenReady()
            await updateShopperContext.mutate({
                parameters: {usid, siteId},
                body: {
                    assignmentQualifiers: {
                        STORE: store.id
                    }
                }
            })

            setSelectedStore(store)
        }
    }

    const availableSlotBlock = (store) => {
        if (isSlotLoading) {
            return (
                <HStack gap="0.1em 0.5em" fontSize={'14px'} fontWeight={'400'}>
                    <SlClock />
                    <Spinner size="xs" color="gray.400" />
                </HStack>
            )
        }

        // Slot available & no slot already reserved
        if (!isSlotLoading && store.nextSlot && !reservedSlot) {
            const now = new Date()
            const startDateTime = new Date(store.nextSlot.startDateTime)
            const endDateTime = new Date(store.nextSlot.endDateTime)

            return (
                <HStack gap="0.1em 0.5em" fontSize={'14px'} fontWeight={'400'}>
                    <SlClock />
                    <Text>
                        Next pickup slot <b>{dayjs().to(startDateTime)}</b> -{' '}
                    </Text>
                    <Text>
                        {dayjs(startDateTime).format('ddd D MMM')},{' '}
                        {dayjs(startDateTime).format('H:mm')} to {dayjs(endDateTime).format('H:mm')}
                    </Text>
                    <Button
                        size="sm"
                        colorScheme="teal"
                        variant="link"
                        ml={2}
                        onClick={() => softReserveHandler(store)}
                    >
                        Reserve slot
                    </Button>
                </HStack>
            )
        }

        // Slot available & another slot already reserved
        if (!isSlotLoading && store.nextSlot && reservedSlot) {
            const startDateTime = new Date(store.nextSlot.startDateTime)
            const endDateTime = new Date(store.nextSlot.endDateTime)

            return (
                <HStack gap="0.1em 0.5em" fontSize={'14px'} fontWeight={'400'}>
                    <SlClock />
                    <Text>
                        Next pickup slot <b>{dayjs().to(startDateTime)}</b> -{' '}
                    </Text>
                    <Text>
                        {dayjs(startDateTime).format('ddd D MMM')},{' '}
                        {dayjs(startDateTime).format('H:mm')} to {dayjs(endDateTime).format('H:mm')}
                    </Text>
                    <Button
                        size="sm"
                        colorScheme="teal"
                        variant="link"
                        ml={2}
                        // to be implemented
                        onClick={() => cancelAndSoftReserveHandler(store)}
                    >
                        Reserve slot
                    </Button>
                </HStack>
            )
        }

        // No slot available
        if (!isSlotLoading && !store.nextSlot) {
            return (
                <HStack gap="0.5em" fontSize={'14px'} fontWeight={'400'}>
                    <SlClock />
                    <Text>No slots available yet</Text>
                    <BsEmojiNeutral />
                </HStack>
            )
        }
    }

    return (
        <>
            <UnorderedList marginLeft={'0px'}>
                {stores.map((store) => (
                    <ListItem paddingY="8px" listStyleType={'none'} key={store.id}>
                        <Box className="store-box">
                            <Box
                                borderWidth="2px"
                                borderRadius="lg"
                                overflow="hidden"
                                _hover={{
                                    borderColor: '#0176D3'
                                }}
                                onClick={() => storeClick(store.id)}
                                id={store.id}
                                position="relative"
                                backgroundColor="white"
                            >
                                {/* Alexis custom start - button for selecting store for inventory lookup */}
                                {store.c_pricebookID &&
                                    (store.id === selectedStore.id ? (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            position="absolute"
                                            right="2"
                                            bottom="1"
                                            onClick={() => unselectStoreHandler()}
                                        >
                                            <FormattedMessage
                                                defaultMessage="My Store"
                                                id="storelocator.setasmystore"
                                            />
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            position="absolute"
                                            right="2"
                                            bottom="1"
                                            onClick={() => selectStoreHandler(store)}
                                        >
                                            <FormattedMessage
                                                defaultMessage="Shop this Store"
                                                id="storelocator.setasmystore"
                                            />
                                        </Button>
                                    ))}
                                {/* Alexis custom end */}
                                {store.image ? (
                                    <Box
                                        margin="auto"
                                        width="100%"
                                        height="113px"
                                        backgroundImage={store.image.replace(
                                            /https:\/\/.+?\//,
                                            'https://edge.disstg.commercecloud.salesforce.com/dw/image/v2/ZZSE_216/'
                                        )}
                                        backgroundColor="gray"
                                    ></Box>
                                ) : (
                                    // <Img
                                    //     alt="test"
                                    //     //src={getAssetUrl('static/img/banner.png')}
                                    //     src={store.image.replace(
                                    //         /https:\/\/.+?\//,
                                    //         'https://edge.disstg.commercecloud.salesforce.com/dw/image/v2/ZZSE_216/'
                                    //     )}
                                    //     margin="auto"
                                    //     width="100%"
                                    //     fallback={<Skeleton width="100%" />}
                                    // />
                                    <Img
                                        alt="test"
                                        src={getAssetUrl('static/img/store-default.jpg')}
                                        margin="auto"
                                        width="100%"
                                    />
                                )}
                                <VStack
                                    align="flex-start"
                                    spacing="0.1em"
                                    paddingLeft={'25px'}
                                    paddingRight={'25px'}
                                    paddingTop={'10px'}
                                    paddingBottom={'10px'}
                                >
                                    <Box>
                                        <Heading
                                            fontSize={'16px'}
                                            lineHeight={'24px'}
                                            fontWeight={'700'}
                                        >
                                            {store.name}
                                        </Heading>
                                    </Box>

                                    <HStack gap="0.3em">
                                        <SlLocationPin />
                                        <Text
                                            fontSize={'14px'}
                                            lineHeight={'21px'}
                                            fontWeight={'400'}
                                            color={'#181818'}
                                        >
                                            {storeAddress(
                                                store.address1,
                                                store.city,
                                                store.state,
                                                store.postalCode
                                            )}
                                        </Text>
                                    </HStack>
                                    {/* Alexis custom - hiding phone */}
                                    {/* <Box
                                        fontSize={'14px'}
                                        lineHeight={'21px'}
                                        fontWeight={'400'}
                                        color={'#747474'}
                                    >
                                        <Text color={'#747474'}>
                                        <Text>
                                            {intl.formatMessage({
                                                defaultMessage: 'Phone: ',
                                                id: 'storelocator.storeinfo.phone'
                                            })}{' '}
                                            {store.phone}
                                        </Text>
                                    </Box> */}

                                    {/* Alexis custom grocery - Next available slot */}
                                    {availableSlotBlock(store)}

                                    <Box>
                                        <Text color={'blue'} paddingTop={'16px'}>
                                            <Link
                                                to={{
                                                    pathname: `/store/${store.id}`
                                                }}
                                            >
                                                {intl.formatMessage({
                                                    defaultMessage: 'Show Details',
                                                    id: 'storelocator.storeinfo.showdetails'
                                                })}
                                            </Link>
                                        </Text>
                                    </Box>
                                    <Input
                                        placeholder={intl.formatMessage({
                                            defaultMessage: 'Search by location or store name',
                                            id: 'storelocator.storeinfo.placegolder'
                                        })}
                                        value={store.id}
                                        type="hidden"
                                    />
                                </VStack>
                            </Box>
                        </Box>
                    </ListItem>
                ))}
            </UnorderedList>
            <Box id="list-bottom"></Box>
        </>
    )
}

export default StoreInformationComponent
