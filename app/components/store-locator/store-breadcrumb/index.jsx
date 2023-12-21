import React from 'react'

// Components
import {Box, Text} from '@salesforce/retail-react-app/app/components/shared/ui'

// Utils
import Link from '../../link'

// Translations
import {useIntl} from 'react-intl'

// Interfaces
import {IStoreBreadCrumb} from '../../../utils/store-locator/storelocator_types'

/**
 * Store BreadCrumb component used on store page and store details page.
 */
const StoreBreadCrumb = ({home, storeName}) => {
    //Instantiate resource object
    const intl = useIntl()

    // stores href
    const STORES_HREF = '/stores'

    /**
     * @function checkBreadCrumb
     * @description Function that creates the breadcrumb of stores
     * @returns The store's homepage breadcrumb(/store/) or the store's homepage breadcrumb plus the name of the store being viewed
     */
    const checkBreadCrumb = () => {
        if (home === true) {
            return (
                <Text fontSize={'14px'} lineHeight={'21px'}>
                    <Link to={STORES_HREF}>
                        {intl.formatMessage({
                            defaultMessage: 'Store Locator',
                            id: 'storelocator.breadcrumb'
                        })}{' '}
                    </Link>
                </Text>
            )
        } else {
            return (
                <Text fontSize={'14px'} lineHeight={'21px'}>
                    <Link to={STORES_HREF}>
                        {intl.formatMessage({
                            defaultMessage: 'Store Locator',
                            id: 'storelocator.breadcrumb'
                        })}{' '}
                    </Link>
                    &gt; {storeName}
                </Text>
            )
        }
    }

    return (
        <>
            <Box paddingY="10px">{checkBreadCrumb()}</Box>
        </>
    )
}

export default StoreBreadCrumb
