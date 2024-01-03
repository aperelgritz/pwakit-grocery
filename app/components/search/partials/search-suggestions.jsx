/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React, {Fragment} from 'react'
import PropTypes from 'prop-types'
import {Stack, Divider, Text} from '@salesforce/retail-react-app/app/components/shared/ui'
import RecentSearches from '@salesforce/retail-react-app/app/components/search/partials/recent-searches'
import Suggestions from '@salesforce/retail-react-app/app/components/search/partials/suggestions'

// Alexis custom
import NewProductSuggestions from './new-product-suggestions'
import {useIntl, FormattedMessage} from 'react-intl'

const SearchSuggestions = ({recentSearches, searchSuggestions, closeAndNavigate}) => {
    // Alexis custom
    // const useSuggestions = searchSuggestions && searchSuggestions?.categorySuggestions?.length
    const phraseSugg = searchSuggestions && searchSuggestions?.phraseSuggestions?.length > 0
    const catSugg = searchSuggestions && searchSuggestions?.categorySuggestions?.length > 0
    const prodSugg = searchSuggestions && searchSuggestions?.productSuggestions?.length > 0
    const contentSugg = searchSuggestions && searchSuggestions?.contentSuggestions?.length > 0
    const useSugg = phraseSugg || catSugg || prodSugg || contentSugg

    if (!useSugg) {
        return (
            <Stack padding={6} spacing={0}>
                <RecentSearches
                    recentSearches={recentSearches}
                    closeAndNavigate={closeAndNavigate}
                />
            </Stack>
        )
    }

    /*
    return (
        <Stack padding={6} spacing={0}>
            {useSuggestions ? (
                <Fragment>
                    <Suggestions
                        closeAndNavigate={closeAndNavigate}
                        suggestions={searchSuggestions?.categorySuggestions}
                    />
                    <Suggestions
                        closeAndNavigate={closeAndNavigate}
                        suggestions={searchSuggestions?.phraseSuggestions}
                    />
                    <Suggestions suggestions={searchSuggestions.productSuggestions} />
                </Fragment>
            ) : (
                <RecentSearches
                    recentSearches={recentSearches}
                    closeAndNavigate={closeAndNavigate}
                />
            )}
        </Stack>
    )
    */

    return (
        <Stack padding={6} spacing={0}>
            {phraseSugg && (
                <>
                    <Text fontSize="lg" as="i">
                        <FormattedMessage
                            defaultMessage="Did you mean"
                            id="search_suggestions.label.did-you-mean"
                        />
                    </Text>
                    <Suggestions
                        closeAndNavigate={closeAndNavigate}
                        suggestions={searchSuggestions?.phraseSuggestions}
                    />
                    <Divider />
                </>
            )}
            {catSugg && (
                <>
                    <Text fontSize="lg" as="i">
                        <FormattedMessage
                            defaultMessage="Categories"
                            id="search_suggestions.label.categories"
                        />
                    </Text>
                    <Suggestions
                        closeAndNavigate={closeAndNavigate}
                        suggestions={searchSuggestions?.categorySuggestions}
                    />
                    <Divider />
                </>
            )}
            {prodSugg && (
                <>
                    <Text fontSize="lg" as="i">
                        <FormattedMessage
                            defaultMessage="Products"
                            id="search_suggestions.label.products"
                        />
                    </Text>
                    <NewProductSuggestions
                        closeAndNavigate={closeAndNavigate}
                        suggestions={searchSuggestions?.productSuggestions}
                    />
                    <Divider />
                </>
            )}
            {contentSugg && (
                <>
                    <Text fontSize="lg" as="i">
                        <FormattedMessage
                            defaultMessage="Content"
                            id="search_suggestions.label.content"
                        />
                    </Text>
                    <Suggestions
                        closeAndNavigate={closeAndNavigate}
                        suggestions={searchSuggestions?.contentSuggestions}
                    />
                </>
            )}
        </Stack>
    )
}

SearchSuggestions.propTypes = {
    recentSearches: PropTypes.array,
    searchSuggestions: PropTypes.object,
    closeAndNavigate: PropTypes.func
}

export default SearchSuggestions
