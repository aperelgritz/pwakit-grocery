import React from 'react'

import {Box, Flex, Image, Link, Text} from '@salesforce/retail-react-app/app/components/shared/ui'

import {getAssetUrl} from '@salesforce/pwa-kit-react-sdk/ssr/universal/utils'

const ContentCard = ({card}) => {
    return (
        // <Flex bg="#edf3f8" p={50} w="full" alignItems="center" justifyContent="center">
        <Flex alignItems="center" justifyContent="center">
            <Box w="xs" bg="white" shadow="lg" rounded="lg" overflow="hidden" mx="auto">
                <Image w="full" h={56} fit="cover" src={getAssetUrl(card.img)} alt="avatar" />

                <Box py={5} textAlign="center">
                    <Link display="block" fontSize="2xl" color="gray.800" fontWeight="bold">
                        {card.label}
                    </Link>
                    <Text as="span" fontSize="sm" color="gray.700">
                        {card.description}
                    </Text>
                </Box>
            </Box>
        </Flex>
    )
}

export default ContentCard
