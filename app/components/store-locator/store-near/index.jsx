// React Imports
import React from 'react'
import {Link} from 'react-router-dom'

// Components
import {Box, Text, Input} from '@chakra-ui/react'

// Translations
import {useIntl} from 'react-intl'

/**
 * Component for stores that are near/related to the store being viewed.
 * NOT USED
 */
const StoreInformationNearComponent = ({
    id,
    name,
    phone,
    longitude,
    latitude,
    addressLine,
    store_hours,
    city,
    state,
    postal_code
}) => {
    //Instantiate resource object
    const intl = useIntl()

    // Click event on store
    const storeClick = (id) => {
        console.log('button clicked ' + id)
    }

    return (
        <Box paddingY="10px">
            <Box
                borderWidth="2px"
                borderRadius="lg"
                overflow="hidden"
                _hover={{
                    borderColor: 'blue'
                }}
                onClick={() => storeClick(id)}
            >
                <Box p="6">
                    <Box mt="1" fontWeight="semibold" as="h4" lineHeight="tight" isTruncated>
                        <Text>{name}</Text>
                    </Box>

                    <Box>
                        <Text>
                            {intl.formatMessage({
                                defaultMessage: 'Address Line: ',
                                id: 'storelocator.storenear.addressline'
                            })}{' '}
                            {addressLine}
                        </Text>
                    </Box>
                    <Box paddingBottom={'20px'}>
                        <Text>
                            {intl.formatMessage({
                                defaultMessage: 'Phone: ',
                                id: 'storelocator.storenear.phone'
                            })}{' '}
                            {phone}
                        </Text>
                    </Box>

                    <Box>
                        <Text as="u" color={'blue'}>
                            <Link
                                to={{
                                    pathname: '/store/',
                                    store: id
                                }}
                            >
                                {intl.formatMessage({
                                    defaultMessage: 'Show Details',
                                    id: 'storelocator.storenear.showdetails'
                                })}
                            </Link>
                        </Text>
                    </Box>
                    <Input
                        placeholder={intl.formatMessage({
                            defaultMessage: 'Search by location or store name',
                            id: 'storelocator.storenear.placegolder'
                        })}
                        value={id}
                        type="hidden"
                    />
                </Box>
            </Box>
        </Box>
    )
}

export default StoreInformationNearComponent
