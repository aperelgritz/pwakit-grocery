/*
 * Copyright (c) 2023, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Provide the sites for your app. Each site includes site id, and its localization configuration.
// You can also provide aliases for your locale. They will be used in place of your locale id when generating paths across the app

// Alexis custom - original:
// module.exports = [
//     {
//         id: 'RefArchGlobal',
//         l10n: {
//             supportedCurrencies: ['EUR'],
//             defaultCurrency: 'USD',
//             defaultLocale: 'en-US',
//             supportedLocales: [
//                 {
//                     id: 'en-US',
//                     // alias: 'us',
//                     preferredCurrency: 'USD'
//                 }
//             ]
//         }
//     }
// ]

module.exports = [
    {
        id: 'RefArchGlobal',
        l10n: {
            supportedCurrencies: ['EUR', 'GBP'],
            defaultCurrency: 'EUR',
            defaultLocale: 'fr-FR',
            supportedLocales: [
                {
                    id: 'fr-FR',
                    alias: 'fr',
                    preferredCurrency: 'EUR'
                },
                {
                    id: 'en-GB',
                    alias: 'en',
                    preferredCurrency: 'GBP'
                }
            ]
        }
    },
    {
        id: 'SunnieFoods',
        l10n: {
            supportedCurrencies: ['EUR'],
            defaultCurrency: 'EUR',
            defaultLocale: 'en-BE',
            supportedLocales: [
                {
                    id: 'en-BE',
                    alias: 'en',
                    preferredCurrency: 'EUR'
                }
            ]
        }
    }
]
