/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
export default {
    baseStyle: () => ({
        container: {},
        favIcon: {
            position: 'absolute',
            variant: 'unstyled',
            top: 2,
            right: 2
        },
        imageWrapper: {
            position: 'relative',
            marginBottom: 2
        },
        image: {
            ratio: 1,
            paddingBottom: 2
        },
        price: {
            // Alexis custom
            fontSize: '2xl'
        },
        // Alexis custom
        priceStrikethrough: {
            textDecoration: 'line-through',
            fontSize: 'xl'
        },
        // Alexis custom
        pricePerUnit: {
            fontWeight: 200,
            fontSize: 'sm'
        },
        title: {
            // Alexis custom
            //fontWeight: 600
            fontWeight: 300
        },
        rating: {},
        variations: {},
        // Alexis custom
        brand: {
            fontWeight: 600,
            fontSize: 'md'
        },
        // Alexis custom
        dietaryIcons: {
            position: 'absolute',
            variant: 'unstyled',
            top: 2,
            left: 1
        }
    }),
    parts: ['container', 'imageWrapper', 'image', 'price', 'title', 'rating', 'variations', 'brand']
}
