// Alexis: new component, based on suggestions.jsx

import React from 'react'
import PropTypes from 'prop-types'
import {Stack, Box} from '@salesforce/retail-react-app/app/components/shared/ui'

import ProductSuggestionItem from './product-suggestion-item'

const ProductSuggestions = ({suggestions, closeAndNavigate}) => {
    return (
        <>
            <Stack spacing={0} data-testid="sf-suggestion">
                <Box mx={'-16px'}>
                    {/* <Box> */}
                    {suggestions.map((product, idx) => (
                        <ProductSuggestionItem
                            product={product}
                            key={idx}
                            closeAndNavigate={closeAndNavigate}
                        />
                    ))}
                </Box>
            </Stack>
        </>
    )
}

ProductSuggestions.propTypes = {
    suggestions: PropTypes.array,
    closeAndNavigate: PropTypes.func
}

export default ProductSuggestions
