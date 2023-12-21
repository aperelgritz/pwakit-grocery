/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React, {useRef, useState} from 'react'
import PropTypes from 'prop-types'
import {useIntl} from 'react-intl'

// Alexis custom grocery
import {Link as RouterLink} from 'react-router-dom'

import {
    useMultiStyleConfig,
    Box,
    Flex,
    IconButton,
    Badge,
    Button,
    Popover,
    PopoverHeader,
    PopoverTrigger,
    PopoverContent,
    PopoverBody,
    PopoverFooter,
    PopoverArrow,
    Stack,
    Text,
    Divider,
    useDisclosure,
    useMediaQuery,
    // Alexis custom grocery
    Spacer,
    CloseButton,
    Spinner,
    HStack
} from '@salesforce/retail-react-app/app/components/shared/ui'
import {
    AuthHelpers,
    useAuthHelper,
    useCustomerType,
    useShopperContextsMutation,
    useUsid
} from '@salesforce/commerce-sdk-react'

import {useCurrentBasket} from '@salesforce/retail-react-app/app/hooks/use-current-basket'

import Link from '@salesforce/retail-react-app/app/components/link'
import Search from '@salesforce/retail-react-app/app/components/search'
import withRegistration from '@salesforce/retail-react-app/app/components/with-registration'
import {
    AccountIcon,
    BrandLogo,
    BasketIcon,
    HamburgerIcon,
    ChevronDownIcon,
    HeartIcon,
    SignoutIcon,
    CloseIcon
} from '@salesforce/retail-react-app/app/components/icons'

import {navLinks, messages} from '@salesforce/retail-react-app/app/pages/account/constant'
import useNavigation from '@salesforce/retail-react-app/app/hooks/use-navigation'

import LoadingSpinner from '@salesforce/retail-react-app/app/components/loading-spinner'
import {isHydrated, noop} from '@salesforce/retail-react-app/app/utils/utils'

// Alexis custom grocery
import {AiOutlineShop, AiOutlineComment} from 'react-icons/ai'
import {TbDiscount2} from 'react-icons/tb'
import {Slide} from '@chakra-ui/react'
import dayjs from 'dayjs'

// Alexis custom - store context
import {useStore} from '../../hooks/use-store'
import {getConfig} from '@salesforce/pwa-kit-runtime/utils/ssr-config'
import useTimeslotMgr from '../../commerce-api/use-timeslot-manager'
import {isServer} from '@salesforce/retail-react-app/app/utils/utils'

const ENTER_KEY = 'Enter'

const IconButtonWithRegistration = withRegistration(IconButton)
/**
 * The header is the main source for accessing
 * navigation, search, basket, and other
 * important information and actions. It persists
 * on the top of your application and will
 * respond to changes in device size.
 *
 * To customize the styles, update the themes
 * in theme/components/project/header.js
 * @param  props
 * @param   {func} props.onMenuClick click event handler for menu button
 * @param   {func} props.onLogoClick click event handler for menu button
 * @param   {object} props.searchInputRef reference of the search input
 * @param   {func} props.onMyAccountClick click event handler for my account button
 * @param   {func} props.onMyCartClick click event handler for my cart button
 * @return  {React.ReactElement} - Header component
 */
const Header = ({
    children,
    onMenuClick = noop,
    onMyAccountClick = noop,
    onLogoClick = noop,
    onMyCartClick = noop,
    onWishlistClick = noop,
    ...props
}) => {
    const intl = useIntl()
    const {
        derivedData: {totalItems},
        data: basket
    } = useCurrentBasket()
    const {isRegistered} = useCustomerType()
    const logout = useAuthHelper(AuthHelpers.Logout)
    const navigate = useNavigation()
    const {isOpen, onClose, onOpen} = useDisclosure()
    const [isDesktop] = useMediaQuery('(min-width: 992px)')

    const [showLoading, setShowLoading] = useState(false)
    // tracking if users enter the popover Content,
    // so we can decide whether to close the menu when users leave account icons
    const hasEnterPopoverContent = useRef()

    const styles = useMultiStyleConfig('Header')

    // Alexis custom - store & reservation context
    const {store, setStore, reservedSlot, setReservedSlot, isLoading} = useStore()
    const {getUsidWhenReady} = useUsid()
    const {
        app: {
            commerceAPI: {
                parameters: {siteId}
            }
        }
    } = getConfig()
    const updateShopperContext = useShopperContextsMutation('updateShopperContext')

    // Alexis custom - get timeslot manager cancel function
    const {timeslotMgrCancelReserve} = useTimeslotMgr()

    const onSignoutClick = async () => {
        setShowLoading(true)
        await logout.mutateAsync()
        navigate('/login')
        setShowLoading(false)
    }

    const keyMap = {
        Escape: () => onClose(),
        Enter: () => onOpen()
    }

    const handleIconsMouseLeave = () => {
        // don't close the menu if users enter the popover content
        setTimeout(() => {
            if (!hasEnterPopoverContent.current) onClose()
        }, 100)
    }

    const handleRemoveStoreContext = async () => {
        const usid = await getUsidWhenReady()

        let slotToCancel = reservedSlot
        if (!reservedSlot && !isServer) {
            const resFromLocalStorage = localStorage.getItem('ts_manager_res')
            if (resFromLocalStorage) {
                slotToCancel = JSON.parse(resFromLocalStorage).reservationId
            }
        }

        if (slotToCancel) {
            const cancelRes = await timeslotMgrCancelReserve(slotToCancel.reservationId)
            if (cancelRes.status === 'CANCELLED') {
                setReservedSlot('')
            }
        }

        const updateRes = await updateShopperContext.mutate({
            parameters: {usid, siteId},
            body: {
                assignmentQualifiers: {
                    STORE: ''
                }
            }
        })
        setStore({})
    }

    return (
        <>
            {/* Alexis custom start - Show reserved slot */}
            {reservedSlot && (
                <Slide direction="top" in={!isOpen} style={{zIndex: 10}}>
                    <HStack p="2px" color="white" bg="teal.500" justify="center" align="middle">
                        <Text fontSize="sm" align="center" flexBasis="98%">
                            Timeslot reserved!{' '}
                            {dayjs(reservedSlot.startDateTime).format('ddd D MMM')},{' '}
                            {dayjs(reservedSlot.startDateTime).format('H:mm')} to{' '}
                            {dayjs(reservedSlot.endDateTime).format('H:mm')}
                            {' | '}
                            Check out by{' '}
                            <Text as="b">
                                {dayjs(reservedSlot.reservationExpiry).format('HH:mm')}
                            </Text>{' '}
                            to keep it
                        </Text>
                        <IconButton
                            variant="ghost"
                            //size="xs"
                            height="1.5em"
                            width="1.5em"
                            colorScheme="white"
                            onClick={onOpen}
                            icon={<CloseIcon />}
                        />
                    </HStack>
                </Slide>
            )}
            {/* Alexis custom end */}
            <Box {...styles.container} {...props}>
                <Box {...styles.content}>
                    {showLoading && <LoadingSpinner wrapperStyles={{height: '100vh'}} />}
                    <Flex wrap="wrap" alignItems={['baseline', 'baseline', 'baseline', 'center']}>
                        <IconButton
                            aria-label={intl.formatMessage({
                                id: 'header.button.assistive_msg.logo',
                                defaultMessage: 'Logo'
                            })}
                            icon={<BrandLogo {...styles.logo} />}
                            {...styles.icons}
                            variant="unstyled"
                            onClick={onLogoClick}
                        />
                        {/* Alexis custom grocery - moved hamburger menu after logo */}
                        <IconButton
                            aria-label={intl.formatMessage({
                                id: 'header.button.assistive_msg.menu',
                                defaultMessage: 'Menu'
                            })}
                            icon={<HamburgerIcon />}
                            variant="unstyled"
                            // Alexis custom grocery - commented "display“ to always show hamburger menu
                            //display={{lg: 'none'}}
                            {...styles.icons}
                            onClick={onMenuClick}
                        />

                        {/* Alexis custom grocery - moved catalog menu to below main header */}
                        {/* <Box {...styles.bodyContainer}>{children}</Box> */}

                        {/* Alexis custom grocery - added spacer to push elements below to right */}
                        <Spacer />

                        {/* Alexis custom grocery - new promotions button */}
                        <IconButton
                            {...styles.accountIcon}
                            variant="ghost"
                            color="black"
                            px={2}
                            aria-label={intl.formatMessage({
                                defaultMessage: 'Promotions'
                            })}
                            icon={
                                <>
                                    <TbDiscount2 fontSize="28px" />
                                    <Text
                                        ml={2}
                                        fontSize="sm"
                                        display={{
                                            sm: 'none',
                                            md: 'none',
                                            lg: 'none',
                                            xl: 'inherit'
                                        }}
                                    >
                                        {intl.formatMessage({
                                            defaultMessage: 'Promotions'
                                        })}
                                    </Text>
                                </>
                            }
                        />

                        {/* Alexis custom grocery - select store. TODO: move to _app, like account, cart, etc */}
                        {isLoading && (
                            <IconButton
                                {...styles.accountIcon}
                                variant="ghost"
                                color="black"
                                px={2}
                                tabIndex={0}
                                aria-label={intl.formatMessage({
                                    defaultMessage: 'My Store'
                                })}
                                icon={
                                    <HStack width={{lg: 'auto', xl: '160px'}}>
                                        <AiOutlineShop fontSize="28px" />
                                        <Spinner />
                                    </HStack>
                                }
                            />
                        )}

                        {/* Alexis custom grocery - display store in context */}
                        {!isLoading && store?.id && (
                            <>
                                <RouterLink to={`/stores`}>
                                    <IconButton
                                        {...styles.accountIcon}
                                        variant="ghost"
                                        color="black"
                                        px={2}
                                        tabIndex={0}
                                        aria-label={intl.formatMessage({
                                            defaultMessage: 'My Store'
                                        })}
                                        icon={
                                            <>
                                                <AiOutlineShop fontSize="28px" />
                                                <Text
                                                    ml={2}
                                                    display={{
                                                        sm: 'none',
                                                        md: 'none',
                                                        lg: 'none',
                                                        xl: 'block'
                                                    }}
                                                    width="100px"
                                                    fontSize="sm"
                                                    textAlign="left"
                                                    // Alexis custom - CSS props don't behave properly directly on Text
                                                    style={{
                                                        textOverflow: 'ellipsis',
                                                        lineHeight: '1.2em',
                                                        maxHeight: '2.4em',
                                                        wordWrap: 'normal',
                                                        textWrap: 'wrap',
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    {store.name}
                                                </Text>
                                            </>
                                        }
                                    />
                                </RouterLink>
                                <CloseButton
                                    display="inline"
                                    size="sm"
                                    onClick={() => handleRemoveStoreContext()}
                                />
                            </>
                        )}

                        {/* Alexis custom grocery - display default "Stores" button */}
                        {!isLoading && !store?.id && (
                            <RouterLink to={'/stores'}>
                                <IconButton
                                    {...styles.accountIcon}
                                    variant="ghost"
                                    color="black"
                                    px={2}
                                    tabIndex={0}
                                    aria-label={intl.formatMessage({
                                        defaultMessage: 'My Store'
                                    })}
                                    icon={
                                        <>
                                            <AiOutlineShop fontSize="28px" />
                                            <Text
                                                ml={2}
                                                display={{
                                                    sm: 'none',
                                                    md: 'none',
                                                    lg: 'none',
                                                    xl: 'block'
                                                }}
                                                width="124px"
                                                fontSize="sm"
                                                textAlign="left"
                                                // Alexis custom - CSS props don't behave properly directly on Text
                                                style={{
                                                    textOverflow: 'ellipsis',
                                                    lineHeight: '1.2em',
                                                    maxHeight: '2.4em',
                                                    wordWrap: 'normal',
                                                    textWrap: 'wrap',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                {intl.formatMessage({
                                                    defaultMessage: 'Stores'
                                                })}
                                            </Text>
                                        </>
                                    }
                                />
                            </RouterLink>
                        )}

                        <Box {...styles.searchContainer}>
                            <Search
                                placeholder={intl.formatMessage({
                                    id: 'header.field.placeholder.search_for_products',
                                    defaultMessage: 'Search for products...'
                                })}
                                {...styles.search}
                            />
                        </Box>

                        {/* Alexis custom grocery - new help & contact button */}
                        <IconButton
                            {...styles.accountIcon}
                            variant="ghost"
                            color="black"
                            px={2}
                            aria-label={intl.formatMessage({
                                defaultMessage: 'Help & Contact'
                            })}
                            icon={
                                <>
                                    <AiOutlineComment fontSize="28px" />
                                    <Text
                                        ml={2}
                                        fontSize="sm"
                                        display={{
                                            sm: 'none',
                                            md: 'none',
                                            lg: 'none',
                                            xl: 'inherit'
                                        }}
                                    >
                                        {intl.formatMessage({
                                            defaultMessage: 'Help & Contact'
                                        })}
                                    </Text>
                                </>
                            }
                        />

                        {/* Alexis custom grocery - custom account link with text */}
                        <IconButton
                            {...styles.accountIcon}
                            variant="ghost"
                            color="black"
                            tabIndex={0}
                            onMouseOver={isDesktop ? onOpen : noop}
                            onKeyDown={(e) => {
                                e.key === ENTER_KEY ? onMyAccountClick() : noop
                            }}
                            onClick={onMyAccountClick}
                            aria-label={intl.formatMessage({
                                id: 'header.button.assistive_msg.my_account',
                                defaultMessage: 'My account'
                            })}
                            icon={
                                <>
                                    <AccountIcon mx={2} />
                                    <Text
                                        mr={2}
                                        fontSize="sm"
                                        display={{
                                            sm: 'none',
                                            md: 'none',
                                            lg: 'none',
                                            xl: 'inherit'
                                        }}
                                    >
                                        {intl.formatMessage({
                                            id: 'header.button.assistive_msg.my_account',
                                            defaultMessage: 'My account'
                                        })}
                                    </Text>
                                </>
                            }
                        />
                        {/* Alexis custom grocery - Original account button below */}
                        {/* <AccountIcon
                            {...styles.accountIcon}
                            tabIndex={0}
                            onMouseOver={isDesktop ? onOpen : noop}
                            onKeyDown={(e) => {
                                e.key === ENTER_KEY ? onMyAccountClick() : noop
                            }}
                            onClick={onMyAccountClick}
                            aria-label={intl.formatMessage({
                                id: 'header.button.assistive_msg.my_account',
                                defaultMessage: 'My account'
                            })}
                    /> */}

                        {isRegistered && isHydrated() && (
                            <Popover
                                isLazy
                                arrowSize={15}
                                isOpen={isOpen}
                                placement="bottom-end"
                                onClose={onClose}
                                onOpen={onOpen}
                            >
                                <PopoverTrigger>
                                    <ChevronDownIcon
                                        aria-label="My account trigger"
                                        onMouseLeave={handleIconsMouseLeave}
                                        onKeyDown={(e) => {
                                            keyMap[e.key]?.(e)
                                        }}
                                        {...styles.arrowDown}
                                        onMouseOver={onOpen}
                                        tabIndex={0}
                                    />
                                </PopoverTrigger>

                                <PopoverContent
                                    {...styles.popoverContent}
                                    onMouseLeave={() => {
                                        hasEnterPopoverContent.current = false
                                        onClose()
                                    }}
                                    onMouseOver={() => {
                                        hasEnterPopoverContent.current = true
                                    }}
                                >
                                    <PopoverArrow />
                                    <PopoverHeader>
                                        <Text fontSize="sm">
                                            {intl.formatMessage({
                                                defaultMessage: 'My Account',
                                                id: 'header.popover.title.my_account'
                                            })}
                                        </Text>
                                    </PopoverHeader>
                                    <PopoverBody>
                                        <Stack
                                            spacing={0}
                                            as="nav"
                                            data-testid="account-detail-nav"
                                        >
                                            {navLinks.map((link) => {
                                                const LinkIcon = link.icon
                                                return (
                                                    <Button
                                                        key={link.name}
                                                        as={Link}
                                                        to={`/account${link.path}`}
                                                        useNavLink={true}
                                                        variant="menu-link"
                                                        leftIcon={<LinkIcon boxSize={5} />}
                                                    >
                                                        {intl.formatMessage(messages[link.name])}
                                                    </Button>
                                                )
                                            })}
                                        </Stack>
                                    </PopoverBody>
                                    <PopoverFooter onClick={onSignoutClick} cursor="pointer">
                                        <Divider colorScheme="gray" />
                                        <Button variant="unstyled" {...styles.signout}>
                                            <Flex>
                                                <SignoutIcon boxSize={5} {...styles.signoutIcon} />
                                                <Text as="span" {...styles.signoutText}>
                                                    {intl.formatMessage({
                                                        defaultMessage: 'Log out',
                                                        id: 'header.popover.action.log_out'
                                                    })}
                                                </Text>
                                            </Flex>
                                        </Button>
                                    </PopoverFooter>
                                </PopoverContent>
                            </Popover>
                        )}

                        {/* Alexis custom grocery - modified wishlist icon: */}
                        <IconButtonWithRegistration
                            {...styles.accountIcon}
                            variant="ghost"
                            color="black"
                            aria-label={intl.formatMessage({
                                defaultMessage: 'My Groceries'
                            })}
                            icon={
                                <>
                                    <HeartIcon mx={2} />
                                    <Text
                                        mr={2}
                                        fontSize="sm"
                                        display={{
                                            sm: 'none',
                                            md: 'none',
                                            lg: 'none',
                                            xl: 'inherit'
                                        }}
                                    >
                                        {intl.formatMessage({
                                            defaultMessage: 'My Groceries'
                                        })}
                                    </Text>
                                </>
                            }
                            onClick={onWishlistClick}
                        />
                        {/* Alexis custom grocery - original wishlist icon: */}
                        {/* <IconButtonWithRegistration
                            aria-label={intl.formatMessage({
                                defaultMessage: 'Wishlist',
                                id: 'header.button.assistive_msg.wishlist'
                            })}
                            icon={<HeartIcon />}
                            variant="unstyled"
                            {...styles.icons}
                            onClick={onWishlistClick}
                    /> */}

                        <IconButton
                            aria-label={intl.formatMessage({
                                id: 'header.button.assistive_msg.my_cart',
                                defaultMessage: 'My cart'
                            })}
                            icon={
                                <>
                                    <BasketIcon />
                                    {basket && totalItems > 0 && (
                                        <Badge variant="notification">{totalItems}</Badge>
                                    )}
                                </>
                            }
                            variant="unstyled"
                            {...styles.icons}
                            onClick={onMyCartClick}
                        />
                    </Flex>
                    {/* Alexis custom grocery - moved catalog menu here */}
                    <Box {...styles.bodyContainer}>{children}</Box>
                </Box>
            </Box>
        </>
    )
}

Header.propTypes = {
    children: PropTypes.node,
    onMenuClick: PropTypes.func,
    onLogoClick: PropTypes.func,
    onMyAccountClick: PropTypes.func,
    onWishlistClick: PropTypes.func,
    onMyCartClick: PropTypes.func,
    searchInputRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({current: PropTypes.elementType})
    ])
}

export default Header
