// React Imports
import React from 'react'

// Components
import {Box, Heading} from '@chakra-ui/react'

/**
 * Store Service Tile Component used on stores details page.
 */
const StoreServiceTile = ({contentAssetBody, contentAssetName}) => {
    return (
        <>
            <Box dangerouslySetInnerHTML={{__html: contentAssetBody}} height={'100%'}></Box>
            <Heading marginTop={'20px'}>{contentAssetName}</Heading>
        </>
    )
}

export default StoreServiceTile
