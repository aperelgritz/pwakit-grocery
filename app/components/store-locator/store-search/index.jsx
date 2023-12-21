// React Imports
import React, {useRef, useState, useCallback, useEffect} from 'react'

// Translations
import {useIntl} from 'react-intl'

// Components
import {
    Flex,
    FormControl,
    Heading,
    Input,
    Stack,
    Text,
    Link,
    Box,
    InputLeftAddon,
    InputGroup,
    Icon,
    InputRightAddon,
    useColorMode
} from '@chakra-ui/react'
import {FiNavigation} from 'react-icons/fi'
import {HiOutlineLocationMarker, HiLocationMarker} from 'react-icons/hi'
import {SearchIcon, SmallCloseIcon} from '@chakra-ui/icons'

// debounce
import {debounce} from 'lodash'

/**
 * Store Search Component used on stores page.
 */
const StoreSearch = (props) => {
    //Instantiate resource object
    const intl = useIntl()
    const inputGroupRef = useRef(null)
    const inputRef = useRef(null)

    // Alexis custom - dark mode
    const {colorMode} = useColorMode()

    //React use State
    const [searchInput, setSearchInput] = useState('')

    // update store when user goes back in history
    useEffect(() => {
        if (searchInput !== '') {
            props.handleStoreSearch(searchInput)
            inputRef.current.focus()
        } else {
            props.handleStoreEmpty()
            inputRef.current.focus()
        }
    }, [searchInput])

    /**
     * @function onSearchInputChange
     * @description On click function.Function that detects when the user is typing something in the search input
     */
    const onSearchInputChange = (event) => {
        setSearchInput(event.target.value)
    }

    const debouncedChangeHandler = useCallback(debounce(onSearchInputChange, 500), [])

    /**
     * @function onFocus
     * @description onFocus function for the input group
     */
    const onFocus = () => {
        inputGroupRef.current.style.borderColor = '#0176D3'
        inputGroupRef.current.style.borderStyle = 'solid'
        inputGroupRef.current.style.borderWidth = '2px'
    }

    /**
     * @function onBlur
     * @description onBlur function for the input group
     */
    const onBlur = () => {
        inputGroupRef.current.style.borderColor = '#C9C9C9'
        inputGroupRef.current.style.borderStyle = 'solid'
        inputGroupRef.current.style.borderWidth = '0px'
    }

    /**
     * @function viewAllClick
     * @description On click function. When the user clicks on the "View All" link
     */
    const viewAllClick = () => {
        inputRef.current.value = ''
        setSearchInput('')
        props.handleStoreEmpty()
    }

    /**
     * @function nearMeClick
     * @description On click function. When the user clicks on the "View Stores Near Me" link
     */
    const nearMeClick = () => {
        props.getStoresByUserLocation()
    }

    /**
     * @function onClickXIcon
     * @description On click function. Function that detects when user clicks on "X" icon
     */
    const onClickXIcon = () => {
        inputRef.current.value = ''
        setSearchInput('')
        props.handleStoreEmpty()
    }

    return (
        <>
            <Flex align={'center'} justify={'center'} width={'100%'}>
                <Stack w={'full'} rounded={'xl'} width={'100%'}>
                    <Heading lineHeight={'44.8px'} fontSize={{base: '2xl', md: '32px'}}>
                        {intl.formatMessage({
                            defaultMessage: 'Find a Store Near You',
                            id: 'storelocator.title'
                        })}
                    </Heading>
                    {/* <Text fontSize={{base: 'sm', sm: '16px'}} lineHeight={'24px'} color={'#000000'}>
                        {intl.formatMessage({
                            defaultMessage: 'Using the new OSF Headless Commerce - store locator package',
                            id: 'storelocator.text'
                        })}
                    </Text> */}
                    <Stack spacing={3} direction={['row', 'row']} paddingTop={'16px'}>
                        <FormControl>
                            <InputGroup
                                //backgroundColor={'#F3F3F3'}
                                backgroundColor={colorMode === 'dark' ? 'bluegray.800' : '#F3F3F3'}
                                width={'100%'}
                                borderRadius={'4px'}
                                onFocus={onFocus}
                                onBlur={onBlur}
                                ref={inputGroupRef}
                                className="input-group"
                            >
                                <InputLeftAddon
                                    //backgroundColor={'#F3F3F3'}
                                    backgroundColor={
                                        colorMode === 'dark' ? 'bluegray.800' : '#F3F3F3'
                                    }
                                    pointerEvents="none"
                                    children={<SearchIcon />}
                                    borderWidth={'0px'}
                                />
                                <Input
                                    placeholder="Search by location or store name"
                                    //_placeholder={{color: '#5C5C5C'}}
                                    _placeholder={
                                        colorMode === 'dark' ? {color: 'white'} : {color: '#5C5C5C'}
                                    }
                                    //color={'#5C5C5C'}
                                    color={colorMode === 'dark' ? 'white' : '#5C5C5C'}
                                    type="text"
                                    onChange={debouncedChangeHandler}
                                    borderWidth={'0px'}
                                    ref={inputRef}
                                    _focus={{
                                        borderColor: 'none',
                                        borderStyle: 'none',
                                        borderWidth: 'none'
                                    }}
                                />
                                {searchInput.length > 0 && (
                                    <InputRightAddon
                                        onClick={() => onClickXIcon()}
                                        //backgroundColor={'#F3F3F3'}
                                        backgroundColor={
                                            colorMode === 'dark' ? 'bluegray.800' : '#F3F3F3'
                                        }
                                        borderWidth={'0px'}
                                        children={<SmallCloseIcon />}
                                        _hover={{
                                            cursor: 'pointer'
                                        }}
                                    />
                                )}
                            </InputGroup>
                        </FormControl>
                    </Stack>
                    <Box
                        color={'#0176D3'}
                        fontSize={'14px'}
                        lineHeight={'21px'}
                        paddingTop={'17px'}
                        display={props.numberOfStores === -1 ? 'inherit' : ''}
                    >
                        {props.numberOfStores > 0 ? (
                            <>
                                <Box display={{base: 'flex', md: 'inline-block'}}>
                                    <Icon
                                        as={HiLocationMarker}
                                        display={{base: 'contents', md: 'inline-block'}}
                                    />
                                    <Text
                                        color={colorMode === 'dark' ? 'white' : '#000000'}
                                        fontWeight={'bold'}
                                        paddingLeft={'5px'}
                                        paddingRight={'5px'}
                                        display={'inline-block'}
                                    >
                                        {props.numberOfStores}{' '}
                                        {props.numberOfStores > 1
                                            ? intl.formatMessage({
                                                  defaultMessage: 'Stores Found',
                                                  id: 'storelocator.storesfound'
                                              })
                                            : intl.formatMessage({
                                                  defaultMessage: 'Store Found',
                                                  id: 'storelocator.storefound'
                                              })}
                                    </Text>
                                    <Link
                                        onClick={() => viewAllClick()}
                                        paddingLeft={'5px'}
                                        paddingRight={'15px'}
                                        display={'inline-block'}
                                    >
                                        {intl.formatMessage({
                                            defaultMessage: 'View All',
                                            id: 'storelocator.viewall'
                                        })}
                                    </Link>
                                </Box>
                            </>
                        ) : props.numberOfStores === -1 ? (
                            <Box display={{base: 'flex', md: 'inline-block'}}>
                                <Link
                                    onClick={() => viewAllClick()}
                                    paddingLeft={'5px'}
                                    paddingRight={'15px'}
                                    display={'inline-block'}
                                >
                                    {intl.formatMessage({
                                        defaultMessage: 'Return',
                                        id: 'storelocator.return'
                                    })}
                                </Link>
                            </Box>
                        ) : (
                            <></>
                        )}
                        <Box display={{base: 'inline-block'}}>
                            <Icon
                                as={FiNavigation}
                                display={{base: 'inline'}}
                                color={props.numberOfStoresNearMe === -1 ? '#000000' : 'inherit'}
                                fontSize={'12px'}
                            />
                            {props.numberOfStoresNearMe > 0 ? (
                                <>
                                    <Link
                                        paddingLeft={'5px'}
                                        paddingRight={'5px'}
                                        display={'inline-block'}
                                        onClick={() => nearMeClick()}
                                    >
                                        {props.numberOfStoresNearMe}{' '}
                                        {intl.formatMessage({
                                            defaultMessage: 'Stores Near Me',
                                            id: 'storelocator.storesnearme'
                                        })}
                                    </Link>
                                    <Link
                                        onClick={() => viewAllClick()}
                                        paddingLeft={'5px'}
                                        paddingRight={'15px'}
                                        display={'inline-block'}
                                    >
                                        {intl.formatMessage({
                                            defaultMessage: 'View All',
                                            id: 'storelocator.viewall'
                                        })}
                                    </Link>
                                </>
                            ) : props.numberOfStoresNearMe === -1 ? (
                                <>
                                    <Text
                                        color={'#000000'}
                                        paddingLeft={'5px'}
                                        paddingRight={'5px'}
                                        display={'inline-block'}
                                    >
                                        {0}{' '}
                                        {intl.formatMessage({
                                            defaultMessage: 'Stores Near Me',
                                            id: 'storelocator.storesnearme'
                                        })}
                                    </Text>
                                    <Link
                                        onClick={() => viewAllClick()}
                                        paddingLeft={'5px'}
                                        paddingRight={'15px'}
                                        display={'inline-block'}
                                    >
                                        {intl.formatMessage({
                                            defaultMessage: 'View All',
                                            id: 'storelocator.viewall'
                                        })}
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        paddingLeft={'5px'}
                                        paddingRight={'5px'}
                                        display={'inline-block'}
                                        onClick={() => nearMeClick()}
                                    >
                                        {intl.formatMessage({
                                            defaultMessage: 'View Stores Near Me',
                                            id: 'storelocator.viewstoresnearme'
                                        })}
                                    </Link>
                                </>
                            )}
                        </Box>
                    </Box>
                </Stack>
            </Flex>
        </>
    )
}

export default StoreSearch
