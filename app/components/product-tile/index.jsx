/*
 * Copyright (c) 2022, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React, {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
// Alexis custom grocery - added BasketIcon
import {
    HeartIcon,
    HeartSolidIcon,
    BasketIcon
} from '@salesforce/retail-react-app/app/components/icons'

// Alexis custom grocery
import {PiPlant} from 'react-icons/pi'
import {TbMeatOff} from 'react-icons/tb'

// Components
import {
    AspectRatio,
    Box,
    Skeleton as ChakraSkeleton,
    Text,
    Stack,
    useMultiStyleConfig,
    IconButton,
    // Alexis custom grocery
    Button,
    ButtonGroup,
    VStack,
    Badge,
    Icon,
    Tooltip,
    HStack
} from '@salesforce/retail-react-app/app/components/shared/ui'
import DynamicImage from '@salesforce/retail-react-app/app/components/dynamic-image'

// Hooks
import {useIntl, FormattedMessage} from 'react-intl'

// Other
import {productUrlBuilder} from '@salesforce/retail-react-app/app/utils/url'
import Link from '@salesforce/retail-react-app/app/components/link'
import withRegistration from '@salesforce/retail-react-app/app/components/with-registration'
import {useCurrency} from '@salesforce/retail-react-app/app/hooks'

// Alexis custom grocery - add to basket
import {useCurrentBasket} from '@salesforce/retail-react-app/app/hooks/use-current-basket'
import {useShopperBasketsMutation} from '@salesforce/commerce-sdk-react'
import {useToast} from '@salesforce/retail-react-app/app/hooks/use-toast'

const IconButtonWithRegistration = withRegistration(IconButton)

// Component Skeleton
export const Skeleton = () => {
    const styles = useMultiStyleConfig('ProductTile')
    return (
        <Box data-testid="sf-product-tile-skeleton">
            <Stack spacing={2}>
                <Box {...styles.imageWrapper}>
                    <AspectRatio ratio={1} {...styles.image}>
                        <ChakraSkeleton />
                    </AspectRatio>
                </Box>
                <ChakraSkeleton width="80px" height="20px" />
                <ChakraSkeleton width={{base: '120px', md: '220px'}} height="12px" />
            </Stack>
        </Box>
    )
}

/**
 * The ProductTile is a simple visual representation of a
 * product object. It will show it's default image, name and price.
 * It also supports favourite products, controlled by a heart icon.
 */
const ProductTile = (props) => {
    const intl = useIntl()
    const {
        product,
        enableFavourite = false,
        isFavourite,
        onFavouriteToggle,
        dynamicImageProps,
        ...rest
    } = props

    const {
        currency,
        image,
        price,
        productId,
        hitType,
        // Alexis custom grocery
        c_extend: {
            priceInfo: {
                originalPrice: {value: originalPrice},
                salePrice: {value: salePrice},
                promotionPrice
            },
            availabilityInfo: {webAts, storeAts},
            brand,
            units: {standardUnit, unitValue, unit},
            dietary
        }
    } = product

    // ProductTile is used by two components, RecommendedProducts and ProductList.
    // RecommendedProducts provides a localized product name as `name` and non-localized product
    // name as `productName`. ProductList provides a localized name as `productName` and does not
    // use the `name` property.
    const localizedProductName = product.name ?? product.productName

    const {currency: activeCurrency} = useCurrency()
    const [isFavouriteLoading, setFavouriteLoading] = useState(false)
    const styles = useMultiStyleConfig('ProductTile')

    // Alexis custom start - record and update relevant basket values in component state
    const {data: basket} = useCurrentBasket()
    const showToast = useToast()
    const [qtyInBasket, setQtyInBasket] = useState(0)
    const [itemIdInBasket, setItemIdInBasket] = useState('')
    const [isBasketLoading, setIsBasketLoading] = useState(false)

    useEffect(() => {
        const productInBasket = basket?.productItems?.find(
            (lineItem) => lineItem.productId === productId
        )

        if (productInBasket) {
            setQtyInBasket(productInBasket.quantity)
            setItemIdInBasket(productInBasket.itemId)
        }
    }, [basket])
    // Alexis custom end

    // Alexis custom - check for discounted price - salePrice may not be active
    let onDiscount = price !== originalPrice
    // If store selected, load only the store prices
    //if (storeContext) onDiscount = false

    // Alexis custom grocery - check for product-class promo
    const productPromo = promotionPrice.find((promo) => promo.promoDetails.class === 'product')

    // Alexis custom grocery - check for order-class promo
    const orderPromo = promotionPrice.find((promo) => promo.promoDetails.class === 'order')

    // Alexis custom grocery - price per unit
    let pricePerUnit = price
    if (['kg', 'l'].includes(standardUnit) && ['g', 'ml'].includes(unit)) {
        pricePerUnit = (price * 1000) / unitValue
    }

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
            return [{productId, price, quantity: +1}]
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
            <Stack direction="column" my={0} justifyContent="flex-end">
                {!isSimpleProduct && (
                    <Button variant="ghost">
                        <Link
                            data-testid="product-tile"
                            {...styles.container}
                            to={productUrlBuilder({id: productId}, intl.local)}
                            {...rest}
                        >
                            Detail Page
                        </Link>
                    </Button>
                )}
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
            </Stack>
        )
    }

    // Alexis custom grocery - add to cart only for simple products
    const isSimpleProduct = product?.productType?.item

    return (
        <Stack direction="column" justifyContent="space-between">
            <Stack direction="column" spacing={2}>
                <Link
                    data-testid="product-tile"
                    {...styles.container}
                    to={productUrlBuilder({id: productId}, intl.local)}
                    {...rest}
                >
                    <Box {...styles.imageWrapper}>
                        {image && (
                            <AspectRatio {...styles.image}>
                                <DynamicImage
                                    src={`${image.disBaseLink || image.link}[?sw={width}&q=60]`}
                                    widths={dynamicImageProps?.widths}
                                    imageProps={{
                                        alt: image.alt,
                                        ...dynamicImageProps?.imageProps
                                    }}
                                    // Alexis custom
                                    padding="0 20px"
                                />
                            </AspectRatio>
                        )}

                        {enableFavourite && (
                            <Box
                                onClick={(e) => {
                                    // stop click event from bubbling
                                    // to avoid user from clicking the underlying
                                    // product while the favourite icon is disabled
                                    e.preventDefault()
                                }}
                            >
                                <IconButtonWithRegistration
                                    aria-label={intl.formatMessage({
                                        id: 'product_tile.assistive_msg.wishlist',
                                        defaultMessage: 'Wishlist'
                                    })}
                                    icon={isFavourite ? <HeartSolidIcon /> : <HeartIcon />}
                                    {...styles.favIcon}
                                    disabled={isFavouriteLoading}
                                    onClick={async () => {
                                        setFavouriteLoading(true)
                                        await onFavouriteToggle(!isFavourite)
                                        setFavouriteLoading(false)
                                    }}
                                />
                            </Box>
                        )}
                        {/* Alexis custom start - dietary icons badge */}
                        <VStack align="start" {...styles.dietaryIcons}>
                            {dietary.find((el) => el === 'gluten-free') && (
                                <Box
                                    boxSize={10}
                                    backgroundColor="white"
                                    border="solid gray"
                                    borderRadius="50px"
                                    position="relative"
                                >
                                    <Text
                                        fontSize="11px"
                                        fontWeight="700"
                                        color="gray.800"
                                        position="absolute"
                                        textAlign="center"
                                        lineHeight="1em"
                                        width="2.5em"
                                        style={{
                                            top: '50%',
                                            left: '50%',
                                            translate: '-50% -50%',
                                            wordWrap: 'break-word',
                                            textWrap: 'wrap'
                                        }}
                                    >
                                        NO GLUTEN
                                    </Text>
                                </Box>
                            )}
                            {dietary.find((el) => el === 'vegan') && (
                                <Tooltip label="Vegan">
                                    <Box
                                        boxSize={10}
                                        backgroundColor="white"
                                        border="solid gray"
                                        borderRadius="50px"
                                        position="relative"
                                    >
                                        <Icon
                                            as={TbMeatOff}
                                            boxSize={7}
                                            color="gray.800"
                                            position="absolute"
                                            style={{
                                                top: '50%',
                                                left: '50%',
                                                translate: '-50% -50%'
                                            }}
                                        />
                                    </Box>
                                </Tooltip>
                            )}
                            {dietary.find((el) => el === 'organic') && (
                                <Tooltip label="Organic">
                                    <Box
                                        boxSize={10}
                                        backgroundColor="white"
                                        border="solid gray"
                                        borderRadius="50px"
                                        position="relative"
                                    >
                                        <Icon
                                            as={PiPlant}
                                            boxSize={8}
                                            color="gray.800"
                                            position="absolute"
                                            style={{
                                                top: '54%',
                                                left: '50%',
                                                translate: '-50% -50%'
                                            }}
                                        />
                                    </Box>
                                </Tooltip>
                            )}
                        </VStack>
                    </Box>
                </Link>

                {/* Price */}
                {/* Alexis custom grocery - adding HStack & cart button block */}
                <HStack justify="space-between">
                    <Text {...styles.price} data-testid="product-tile-price">
                        {hitType === 'set' &&
                            intl.formatMessage({
                                id: 'product_tile.label.starting_at_price',
                                defaultMessage: 'Starting at'
                            })}{' '}
                        {intl.formatNumber(price, {
                            style: 'currency',
                            currency: currency || activeCurrency
                        })}
                    </Text>
                    {cartButtonBlock()}
                </HStack>

                {/* Alexis custom - First Product & Order Promo Callouts */}
                <VStack align="start">
                    {productPromo ? (
                        <Badge
                            fontSize="0.85em"
                            colorScheme="green"
                            variant="solid"
                            borderRadius="sm"
                        >
                            {productPromo.promoDetails.callOut}
                        </Badge>
                    ) : (
                        <Badge visibility="hidden" fontSize="0.85em">
                            Placeholder
                        </Badge>
                    )}
                    {orderPromo && (
                        <Badge
                            fontSize="0.85em"
                            colorScheme="cyan"
                            variant="solid"
                            borderRadius="sm"
                        >
                            {orderPromo.promoDetails.callOut}
                        </Badge>
                    )}
                </VStack>

                {/* Alexis custom: Brand */}
                <Stack gap={0} lineHeight="1.3">
                    {brand && <Text {...styles.brand}>{brand}</Text>}

                    <Link
                        data-testid="product-tile"
                        {...styles.container}
                        to={productUrlBuilder({id: productId}, intl.local)}
                        {...rest}
                    >
                        {/* Title */}
                        <Text {...styles.title}>{localizedProductName}</Text>
                    </Link>
                </Stack>

                <Stack direction="column" spacing={0} justifyContent="space-between">
                    {/* Alexis Custom: Price per Unit */}
                    {standardUnit && unitValue && unit && (
                        <Text {...styles.pricePerUnit} data-testid="product-tile-price">
                            {intl.formatNumber(pricePerUnit, {
                                style: 'currency',
                                currency: currency || activeCurrency
                            })}{' '}
                            / {standardUnit.toUpperCase()}
                        </Text>
                    )}
                </Stack>
            </Stack>
        </Stack>
    )
}

ProductTile.displayName = 'ProductTile'

ProductTile.propTypes = {
    /**
     * The product search hit that will be represented in this
     * component.
     */
    product: PropTypes.shape({
        currency: PropTypes.string,
        image: PropTypes.shape({
            alt: PropTypes.string,
            disBaseLink: PropTypes.string,
            link: PropTypes.string
        }),
        price: PropTypes.number,
        // `name` is present and localized when `product` is provided by a RecommendedProducts component
        // (from Shopper Products `getProducts` endpoint), but is not present when `product` is
        // provided by a ProductList component.
        // See: https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-products?meta=getProducts
        name: PropTypes.string,
        // `productName` is localized when provided by a ProductList component (from Shopper Search
        // `productSearch` endpoint), but is NOT localized when provided by a RecommendedProducts
        // component (from Einstein Recommendations `getRecommendations` endpoint).
        // See: https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-search?meta=productSearch
        // See: https://developer.salesforce.com/docs/commerce/einstein-api/references/einstein-api-quick-start-guide?meta=getRecommendations
        // Note: useEinstein() transforms snake_case property names from the API response to camelCase
        productName: PropTypes.string,
        productId: PropTypes.string,
        hitType: PropTypes.string
    }),
    /**
     * Enable adding/removing product as a favourite.
     * Use case: wishlist.
     */
    enableFavourite: PropTypes.bool,
    /**
     * Display the product as a faviourite.
     */
    isFavourite: PropTypes.bool,
    /**
     * Callback function to be invoked when the user
     * interacts with favourite icon/button.
     */
    onFavouriteToggle: PropTypes.func,
    dynamicImageProps: PropTypes.object
}

export default ProductTile
