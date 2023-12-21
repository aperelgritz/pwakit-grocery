// React Import
import React, {useState} from 'react'

// Components
import {Box, Button, Text, Link} from '@salesforce/retail-react-app/app/components/shared/ui'

// Interfaces
import {IStoreInformation} from '../../../utils/store-locator/storelocator_types'

// Translations
import {useIntl} from 'react-intl'

/**
 * Store Details component used on stores page.
 */
const StoreDetailsInfo = ({
    id,
    name,
    phone,
    longitude,
    latitude,
    addressLine,
    store_hours,
    city,
    state,
    postal_code,
    c_services,
    email
}) => {
    //Instantiate resource object
    const intl = useIntl()
    const [urlDirection, setUrlDirection] = useState('')
    const [storeEmail, setStoreEmail] = useState('')

    /**
     * @function getDirections
     * @description Redirects the user to Google Maps with the appropriate longitude and latitude properties
     */
    if (urlDirection === '') {
        setUrlDirection(
            `https://www.google.com/maps/dir//${latitude},${longitude}/@${latitude},${longitude},12z`
        )
    }

    if (storeEmail === '') {
        setStoreEmail('mailto:' + email)
    }

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

    return (
        <>
            <Box padding="20px" backgroundColor={'#F3F3F3'} borderRadius={'4px'}>
                <Text fontSize={'14px'} lineHeight={'21px'} fontWeight={'500'} paddingY={'8px'}>
                    {storeAddress(addressLine, city, state, postal_code)}
                </Text>
                {phone ? (
                    <Text fontSize={'14px'} lineHeight={'21px'} fontWeight={'500'} paddingY={'8px'}>
                        {intl.formatMessage({
                            defaultMessage: 'Phone: ',
                            id: 'storelocator.storeinfo.phone'
                        })}{' '}
                        {phone}
                    </Text>
                ) : (
                    <></>
                )}
                {store_hours ? (
                    <Text fontSize={'14px'} lineHeight={'21px'} fontWeight={'500'} paddingY={'8px'}>
                        {intl.formatMessage({
                            defaultMessage: 'Hours: ',
                            id: 'storelocator.storeinfo.hours'
                        })}{' '}
                        {store_hours}
                    </Text>
                ) : (
                    <></>
                )}
                {c_services ? (
                    <Text fontSize={'14px'} lineHeight={'21px'} fontWeight={'500'} paddingY={'8px'}>
                        {intl.formatMessage({
                            defaultMessage: 'Service: ',
                            id: 'storelocator.storeinfo.service'
                        })}{' '}
                        {c_services && c_services.join(', ')}
                    </Text>
                ) : (
                    <></>
                )}
                {email ? (
                    <Text fontSize={'14px'} lineHeight={'21px'} fontWeight={'500'} paddingY={'8px'}>
                        {intl.formatMessage({
                            defaultMessage: 'Email: ',
                            id: 'storelocator.storeinfo.email'
                        })}{' '}
                        <Link color="blue" href={storeEmail}>
                            {' '}
                            {email}
                        </Link>
                    </Text>
                ) : (
                    <></>
                )}
                <Box paddingTop={'16px'}>
                    <Button
                        colorScheme="blue"
                        variant="solid"
                        width={'100%'}
                        fontSize={'14px'}
                        lineHeight={'21px'}
                        fontWeight={'700'}
                        borderRadius={'4px'}
                    >
                        <Link href={urlDirection} isExternal>
                            {intl.formatMessage({
                                defaultMessage: 'Get Directions',
                                id: 'storelocator.storeinfo.getdirections'
                            })}
                        </Link>
                    </Button>
                </Box>
            </Box>
        </>
    )
}

export default StoreDetailsInfo
