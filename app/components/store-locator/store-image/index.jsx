// React Import
import React from 'react'

// Interfaces
import {IStoreImage} from '../../../utils/store-locator/storelocator_types'

// Components
import {Box, Image} from '@salesforce/retail-react-app/app/components/shared/ui'

/**
 * Store Image Tile component used on stores details page.
 */
const StoreImageTile = ({image, alt}) => {
    return (
        <>
            <Box paddingTop={'16px'} width={'100%'} maxHeight={'215px'} paddingBottom={'16px'}>
                <Image
                    src={image}
                    alt={alt}
                    marginLeft={'auto'}
                    marginRight={'auto'}
                    display={'block'}
                ></Image>
            </Box>
        </>
    )
}

export default StoreImageTile
