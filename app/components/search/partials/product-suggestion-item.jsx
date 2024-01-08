// Alexis: new component, extracted from product-suggestions.jsx
// in order to track basket state for each suggestion line

import React, {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import {useIntl} from 'react-intl'

import {
    Text,
    Button,
    Stack,
    Box,
    Image,
    Link,
    ButtonGroup,
    useMultiStyleConfig,
    HStack
} from '@salesforce/retail-react-app/app/components/shared/ui'
import {BasketIcon} from '@salesforce/retail-react-app/app/components/icons'
import {SkeletonCircle} from '@chakra-ui/react'

import {getAssetUrl} from '@salesforce/pwa-kit-react-sdk/ssr/universal/utils'
import {useCurrentBasket} from '@salesforce/retail-react-app/app/hooks/use-current-basket'
import {useToast} from '@salesforce/retail-react-app/app/hooks/use-toast'
import {useShopperBasketsMutation} from '@salesforce/commerce-sdk-react'
import {API_ERROR_MESSAGE} from '@salesforce/retail-react-app/app/constants'

const ProductSuggestionItem = ({product, idx, closeAndNavigate}) => {
    const intl = useIntl()
    const styles = useMultiStyleConfig('ProductTile')
    const {data: basket} = useCurrentBasket()
    const showToast = useToast()

    // Alexis custom - handle placeholder image skeletons
    const [imgLoaded, setImgLoaded] = useState(false)

    // Alexis custom - basket states
    const [qtyInBasket, setQtyInBasket] = useState(0)
    const [itemIdInBasket, setItemIdInBasket] = useState('')
    const [isBasketLoading, setIsBasketLoading] = useState(false)

    const productId = product.productId
    const price = product.price

    useEffect(() => {
        const productInBasket = basket?.productItems?.find(
            (lineItem) => lineItem.productId === productId
        )

        if (productInBasket) {
            setQtyInBasket(productInBasket.quantity)
            setItemIdInBasket(productInBasket.itemId)
        }
    }, [basket])

    // Alexis custom grocery - load commerce SDK hooks
    const addItemToBasketMutation = useShopperBasketsMutation('addItemToBasket')
    const updateItemInBasketMutation = useShopperBasketsMutation('updateItemInBasket')
    const removeItemFromBasketMutation = useShopperBasketsMutation('removeItemFromBasket')

    // Alexis custom grocery - add to cart
    const handleAddToCart = async () => {
        const showError = () => {
            showToast({
                title: intl.formatMessage(API_ERROR_MESSAGE),
                status: 'error'
            })
        }

        try {
            setIsBasketLoading(true)
            await addItemToBasketMutation.mutateAsync({
                parameters: {basketId: basket?.basketId},
                body: [
                    {
                        productId,
                        price,
                        quantity: +1
                    }
                ]
            })

            //einstein.sendAddToCart(productItems)

            // If the items were successfully added, set the return value to be used
            // by the add to cart modal.
            setIsBasketLoading(false)
            // return [{productId, price, quantity: +1}]
        } catch (error) {
            showError(error)
        }
        setIsBasketLoading(false)
    }

    // Alexis custom grocery - decrease quantity in cart
    const handleDecrementFromCart = async () => {
        const showError = () => {
            showToast({
                title: intl.formatMessage(API_ERROR_MESSAGE),
                status: 'error'
            })
        }

        try {
            setIsBasketLoading(true)
            if (qtyInBasket > 1) {
                await updateItemInBasketMutation.mutateAsync(
                    {
                        parameters: {basketId: basket?.basketId, itemId: itemIdInBasket},
                        body: {
                            productId,
                            price,
                            quantity: parseInt(qtyInBasket - 1)
                        }
                    },
                    {
                        onSuccess: () => {
                            setQtyInBasket(parseInt(qtyInBasket - 1))
                        }
                    }
                )
            } else {
                await removeItemFromBasketMutation.mutateAsync(
                    {
                        parameters: {
                            basketId: basket.basketId,
                            itemId: itemIdInBasket
                        }
                    },
                    {
                        onSuccess: () => {
                            setQtyInBasket(0)
                            setItemIdInBasket('')
                        }
                    }
                )
            }
            setIsBasketLoading(false)
        } catch (error) {
            showError(error)
        }
        setIsBasketLoading(false)
    }

    // Alexis custom grocery - display cart buttons
    const cartButtonBlock = () => {
        return (
            <>
                {isSimpleProduct && !qtyInBasket && (
                    <Button
                        key="cart-button"
                        onClick={handleAddToCart}
                        //disabled={isBasketLoading || showInventoryMessage}
                        isLoading={isBasketLoading}
                        width="2.5rem"
                        size="sm"
                        variant="solid"
                        marginRight="10px"
                    >
                        <BasketIcon />
                    </Button>
                )}
                {isSimpleProduct && qtyInBasket > 0 && (
                    <ButtonGroup isAttached marginRight="10px">
                        <Button
                            size="sm"
                            onClick={handleDecrementFromCart}
                            isLoading={isBasketLoading}
                        >
                            -
                        </Button>
                        <Box width={8} textAlign="center" lineHeight="2em">
                            {qtyInBasket}
                        </Box>
                        <Button size="sm" onClick={handleAddToCart} isLoading={isBasketLoading}>
                            +
                        </Button>
                    </ButtonGroup>
                )}
            </>
        )
    }

    // Alexis custom grocery - add to cart only for simple products
    const isSimpleProduct = product?.type === 'product'

    return (
        <HStack justifyContent="space-between">
            <Button
                width="100%"
                onMouseDown={() => closeAndNavigate('/product/' + product.productId)}
                fontSize={'md'}
                key={idx}
                marginTop={0}
                variant="menu-link"
            >
                {/* Product Image */}
                <SkeletonCircle size={10} isLoaded={imgLoaded} marginRight="10px">
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
                {/* Product Name & Price */}
                {/* <Text
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
                /> */}
                <Text
                    overflow="hidden"
                    textOverflow="ellipsis"
                    fontWeight="400"
                    dangerouslySetInnerHTML={{__html: product.name}}
                />
            </Button>
            {/* Price & Add to cart block */}
            <HStack>
                <Text fontWeight="600">
                    {intl.formatNumber(product.price, {
                        style: 'currency',
                        currency: product.currency || activeCurrency
                    })}
                </Text>
                {cartButtonBlock()}
            </HStack>
        </HStack>
    )
}

export default ProductSuggestionItem
