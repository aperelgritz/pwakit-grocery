/*
 * Copyright (c) 2022, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React, {useEffect, useState} from 'react'
import {useIntl, FormattedMessage} from 'react-intl'
import {useLocation} from 'react-router-dom'

// Components
import {
    Box,
    Button,
    SimpleGrid,
    HStack,
    VStack,
    Text,
    Flex,
    Stack,
    Container,
    Image
    //Link
} from '@salesforce/retail-react-app/app/components/shared/ui'
import Link from '@salesforce/retail-react-app/app/components/link'
import {SkeletonCircle} from '@chakra-ui/react'

// Project Components
import Hero from '@salesforce/retail-react-app/app/components/hero'
import Seo from '@salesforce/retail-react-app/app/components/seo'
import Section from '@salesforce/retail-react-app/app/components/section'
import ProductScroller from '@salesforce/retail-react-app/app/components/product-scroller'
// Alexis custom
import Carousel from '../../components/carousel/index'
import ContentCard from '../../components/content-card/index'
import ContentCards from '../../components/content-cards/index'

// Others
import {getAssetUrl} from '@salesforce/pwa-kit-react-sdk/ssr/universal/utils'
import {heroFeatures, features} from '@salesforce/retail-react-app/app/pages/home/data'

//Hooks
import useEinstein from '@salesforce/retail-react-app/app/hooks/use-einstein'

// Constants
import {
    MAX_CACHE_AGE,
    HOME_SHOP_PRODUCTS_CATEGORY_ID,
    HOME_SHOP_PRODUCTS_LIMIT,
    // Alexis custom grocery
    CAT_MENU_DEFAULT_NAV_SSR_DEPTH,
    CAT_MENU_DEFAULT_ROOT_CATEGORY
} from '@salesforce/retail-react-app/app/constants'
import {useServerContext} from '@salesforce/pwa-kit-react-sdk/ssr/universal/hooks'
import {useProductSearch, useCategory} from '@salesforce/commerce-sdk-react'

/**
 * This is the home page for Retail React App.
 * The page is created for demonstration purposes.
 * The page renders SEO metadata and a few promotion
 * categories and products, data is from local file.
 */
const HomeGrocery = () => {
    const intl = useIntl()
    const einstein = useEinstein()
    const {pathname} = useLocation()

    const {res} = useServerContext()
    if (res) {
        res.set('Cache-Control', `max-age=${MAX_CACHE_AGE}`)
    }

    // ALexis custom - get products on promo
    const {data: productSearchResult, isLoading} = useProductSearch({
        parameters: {
            refine: ['cgid=root', 'pmid=50pct-off-2nd|berries-3-for-2', 'htype=product'],
            // refine: ['htype=product'],
            limit: 10
        }
    })

    /**************** Einstein ****************/
    // Alexis custom - disable Einstein
    /*
    useEffect(() => {
        einstein.sendViewPage(pathname)
    }, [])
    */

    // Alexis custom grocery
    const levelZeroCategoriesQuery = useCategory({
        parameters: {id: CAT_MENU_DEFAULT_ROOT_CATEGORY, levels: CAT_MENU_DEFAULT_NAV_SSR_DEPTH}
    })

    // Alexis custom
    const [imgLoaded, setImgLoaded] = useState(false)

    // Alexis custom - carousel
    const slides = [
        {
            img: getAssetUrl('static/img/rectangle-open-bright-grocery-store-1-min.jpg'),
            label: 'Come Visit!',
            description: 'We are always happy to welcome you to our stores'
        },
        {
            img: getAssetUrl(
                'static/img/top-view-healthy-food-immunity-boosting-composition-min.jpg'
            ),
            label: 'Our Selection',
            description: 'Only the freshest fruits and vegetables'
        }
    ]

    // Alexis custom - content cards
    const cards = [
        {
            img: getAssetUrl('static/img/rectangle-healthy-snacks.jpg'),
            label: 'Fruits & Vegetables',
            description: 'Stock up on healthy snacks',
            catRelPath: '/category/fresh'
        },
        {
            img: getAssetUrl('static/img/rectangle-pantry-staples.webp'),
            label: 'Pantry Staples',
            description: 'Everyday needs for your cupboard',
            catRelPath: '/category/pantry'
        },
        {
            img: getAssetUrl('static/img/rectangle-dishwashing-supplies.jpg'),
            label: 'Make it shine',
            description: 'All your household cleaning essentials',
            catRelPath: '/category/household'
        }
    ]

    return (
        <Box data-testid="home-page" layerStyle="page">
            <Seo
                title="Home Page"
                description="Commerce Cloud Retail React App"
                keywords="Commerce Cloud, Retail React App, React Storefront"
            />
            <Carousel slides={slides} />

            <Section
                padding={4}
                paddingTop={16}
                title={'Shop our Categories'}
                subtitle={'All your grocery and home essentials'}
            >
                <HStack
                    alignItems="center"
                    justifyContent="center"
                    paddingTop={8}
                    gap={0}
                    wrap="wrap"
                >
                    {levelZeroCategoriesQuery.data.categories.map((cat) => (
                        <Link to={`/category/${cat.id}`} textDecoration="none" key={cat.id}>
                            <Flex
                                direction="column"
                                justifyContent="center"
                                alignItems="center"
                                mx="auto"
                            >
                                <SkeletonCircle size={20} isLoaded={imgLoaded}>
                                    <Image
                                        h={20}
                                        w={20}
                                        borderRadius="100px"
                                        shadow="md"
                                        src={cat.image}
                                        fallbackSrc={getAssetUrl('static/img/logo-small.svg')}
                                        onLoad={() => setImgLoaded(true)}
                                    />
                                </SkeletonCircle>
                                <Box w={'8rem'} bg="white" mt={1} rounded="lg" overflow="hidden">
                                    <Text p={1} textAlign="center" color="gray.800">
                                        {cat.name}
                                    </Text>
                                </Box>
                            </Flex>
                        </Link>
                    ))}
                </HStack>
            </Section>

            <ContentCards title="Everyday Essentials" cards={cards} />

            {productSearchResult && (
                <Section
                    padding={4}
                    paddingTop={16}
                    title="Shop Products"
                    subtitle="The best deals here"
                >
                    <Stack pt={8} spacing={16}>
                        <ProductScroller
                            products={productSearchResult?.hits}
                            isLoading={isLoading}
                        />
                    </Stack>
                </Section>
            )}
        </Box>
    )
}

HomeGrocery.getTemplateName = () => 'home'

export default HomeGrocery
