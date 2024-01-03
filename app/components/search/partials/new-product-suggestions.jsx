// Alexis: new component, based on suggestions.jsx

import React, {useState} from 'react'
import PropTypes from 'prop-types'
import {
    Text,
    Button,
    Stack,
    Box,
    Image
} from '@salesforce/retail-react-app/app/components/shared/ui'
// Alexis custom
import {useIntl} from 'react-intl'
import {getAssetUrl} from '@salesforce/pwa-kit-react-sdk/ssr/universal/utils'
import {SkeletonCircle} from '@chakra-ui/react'

const NewProductSuggestions = ({suggestions, closeAndNavigate}) => {
    const intl = useIntl()

    // Alexis custom
    const [imgLoaded, setImgLoaded] = useState(false)

    return (
        <>
            <Stack spacing={0} data-testid="sf-suggestion">
                <Box mx={'-16px'}>
                    {/* <Box> */}
                    {suggestions.map((product, idx) => (
                        <Button
                            width="full"
                            onMouseDown={() => closeAndNavigate('/product/' + product.productId)}
                            fontSize={'md'}
                            key={idx}
                            marginTop={0}
                            variant="menu-link"
                        >
                            <SkeletonCircle size={10} isLoaded={imgLoaded}>
                                <Image
                                    src={`https://edge.disstg.commercecloud.salesforce.com/dw/image/v2/ZZSE_216${product.image}`}
                                    fallbackSrc={getAssetUrl('static/img/logo-small.svg')}
                                    h={10}
                                    w={10}
                                    objectFit="cover"
                                    borderRadius="100%"
                                    marginRight="10px"
                                    onLoad={() => setImgLoaded(true)}
                                />
                            </SkeletonCircle>
                            <Text
                                overflow="hidden"
                                textOverflow="ellipsis"
                                fontWeight="400"
                                dangerouslySetInnerHTML={{
                                    __html:
                                        product.name +
                                        ' | ' +
                                        intl.formatNumber(product.price, {
                                            style: 'currency',
                                            currency: product.currency || activeCurrency
                                        })
                                }}
                            />
                        </Button>
                    ))}
                </Box>
            </Stack>
        </>
    )
}

NewProductSuggestions.propTypes = {
    suggestions: PropTypes.array,
    closeAndNavigate: PropTypes.func
}

export default NewProductSuggestions
