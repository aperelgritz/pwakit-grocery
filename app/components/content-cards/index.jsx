import React from 'react'
import PropTypes from 'prop-types'
import {Link as RouterLink} from 'react-router-dom'

import {Box, Flex, Image, Text} from '@salesforce/retail-react-app/app/components/shared/ui'

import Section from '@salesforce/retail-react-app/app/components/section'

import {getAssetUrl} from '@salesforce/pwa-kit-react-sdk/ssr/universal/utils'

const ContentCards = ({title, cards}) => {
    const hashCode = (s) => {
        return s.split('').reduce(function (a, b) {
            a = (a << 5) - a + b.charCodeAt(0)
            return a & a
        }, 0)
    }

    return (
        <Section padding={4} style={{marginTop: '20px'}} title={title}>
            <Flex
                alignItems="center"
                justifyContent="center"
                gap="1rem"
                wrap="wrap"
                style={{marginTop: '20px'}}
            >
                {cards.map((card) => (
                    <RouterLink to={card.catRelPath}>
                        <Box
                            key={hashCode(card.label)}
                            minWidth="320px"
                            bg="white"
                            shadow="lg"
                            rounded="lg"
                            overflow="hidden"
                        >
                            <Image w="full" h={56} fit="cover" src={card.img} alt="avatar" />

                            <Box py={5} textAlign="center">
                                <Text
                                    display="block"
                                    fontSize="2xl"
                                    color="gray.800"
                                    fontWeight="bold"
                                >
                                    {card.label}
                                </Text>
                                <Text as="span" fontSize="sm" color="gray.700">
                                    {card.description}
                                </Text>
                            </Box>
                        </Box>
                    </RouterLink>
                ))}
            </Flex>
        </Section>
    )
}

ContentCards.displayName = 'ContentCards'

ContentCards.propTypes = {
    title: PropTypes.string.isRequired,
    cards: PropTypes.arrayOf(
        PropTypes.shape({
            img: PropTypes.string,
            label: PropTypes.string,
            description: PropTypes.string,
            catRelPath: PropTypes.string
        })
    ).isRequired
}
export default ContentCards
