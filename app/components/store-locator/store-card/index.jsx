// Components
import {Heading, Stack, Text, Box} from '@salesforce/retail-react-app/app/components/shared/ui'

// Components
import {SearchIcon} from '@salesforce/retail-react-app/app/components/icons'

// React Importes
import React, {useState} from 'react'

// Project Components
import StoreInformationComponent from '../store-information/index.jsx'

// Translations
import {useIntl} from 'react-intl'

/**
 * Store Card component used on stores page.
 */
const StoreCard = (props) => {
    // console.log('props.stores:', props.stores)
    //Instantiate resource object
    const intl = useIntl()

    const [stores, setStores] = useState(props.stores)

    // update store list according to search
    React.useEffect(() => {
        setStores(props.stores)
    }, [props.searchTerm, props.stores])

    return (
        <>
            <Stack direction={{base: 'column', sm: 'row'}} w={'full'} margin={'0'}>
                {Array.isArray(stores) && stores.length > 0 ? (
                    <Box
                        overflowY="scroll"
                        textAlign="initial"
                        height="450px"
                        width={'100%'}
                        id="store-wrapper"
                    >
                        <StoreInformationComponent stores={stores}></StoreInformationComponent>
                    </Box>
                ) : (
                    <Box
                        overflowY="hidden"
                        textAlign="center"
                        width={'100%'}
                        backgroundColor={'#F3F3F3'}
                        padding={'20px'}
                    >
                        <SearchIcon boxSize={16}></SearchIcon>
                        <Heading
                            paddingBottom={'20px'}
                            paddingTop={'20px'}
                            fontSize={'32px'}
                            lineHeight={'44.8px'}
                        >
                            {intl.formatMessage({
                                defaultMessage: 'No Stores Found',
                                id: 'storelocator.nostoresfound'
                            })}
                        </Heading>
                        <Text fontSize={'16px'} lineHeight={'24px'}>
                            {intl.formatMessage({
                                defaultMessage:
                                    'Use the search above to search a location or by store name.',
                                id: 'storelocator.nostoresfound.helptext'
                            })}
                        </Text>
                    </Box>
                )}
            </Stack>
        </>
    )
}

export default StoreCard
