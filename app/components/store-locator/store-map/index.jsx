// Components
import {Box, AspectRatio} from '@salesforce/retail-react-app/app/components/shared/ui'

// React Imports
import React, {useCallback, useContext, useEffect, useRef, useState} from 'react'

// React Context
import {ClickStoreContext} from '../../../pages/store-locator'

// Interfaces
//import {MapPin} from '../../../utils/osfstorelocator/storelocator_types'

/**
 * Map component used on stores page and store details page.
 */
const Map = ({pins}) => {
    const mapRef = useRef(null)
    // for google maps api
    // @ts-ignore
    const [Map, setMap] = useState(null)
    const prevMarkersRef = useRef([])
    const [storeID, setVal] = useContext(ClickStoreContext)
    const [previousPosition, setPreviousPosition] = useState(undefined)
    // console.log('previousPosition:', previousPosition)
    // console.log('storeID:', storeID)
    const [isloaded, setIsloaded] = useState(Boolean)
    const [isUnique, setIsUnique] = useState(Boolean)
    const selectedColor = '#FF5733'

    /**
     * @function clearMarkers
     * @description Function that clears markers from the map
     */
    const clearMarkers = (markers) => {
        if (markers) {
            for (let m of markers) {
                m.setMap(null)
            }
        }
    }

    /**
     * @function onClickMarkerStoreMap
     * @description Function that stores the marker that was clicked
     */
    const onClickMarkerStoreMap = (marker) => {
        setVal(marker)
    }

    /**
     * @function buildMarker
     * @description Function that builds the marker
     * @param pin - MapPin type object
     * @param selected - If this pin was clicked by the user
     * @returns marker - marker object
     */
    const buildMarker = (pin, selected) => {
        let marker = {
            path: pin.storePinSVG
                ? pin.storePinSVG
                : 'M12 2C9.87827 2 7.84344 2.84285 6.34315 4.34315C4.84285 5.84344 4 7.87827 4 10C4 13.0981 6.01574 16.1042 8.22595 18.4373C9.31061 19.5822 10.3987 20.5195 11.2167 21.1708C11.5211 21.4133 11.787 21.6152 12 21.7726C12.213 21.6152 12.4789 21.4133 12.7833 21.1708C13.6013 20.5195 14.6894 19.5822 15.774 18.4373C17.9843 16.1042 20 13.0981 20 10C20 7.87827 19.1571 5.84344 17.6569 4.34315C16.1566 2.84285 14.1217 2 12 2ZM12 23C11.4453 23.8321 11.445 23.8319 11.4448 23.8317L11.4419 23.8298L11.4352 23.8253L11.4123 23.8098C11.3928 23.7966 11.3651 23.7776 11.3296 23.753C11.2585 23.7038 11.1565 23.6321 11.0278 23.5392C10.7705 23.3534 10.4064 23.0822 9.97082 22.7354C9.10133 22.043 7.93939 21.0428 6.77405 19.8127C4.48426 17.3958 2 13.9019 2 10C2 7.34784 3.05357 4.8043 4.92893 2.92893C6.8043 1.05357 9.34784 0 12 0C14.6522 0 17.1957 1.05357 19.0711 2.92893C20.9464 4.8043 22 7.34784 22 10C22 13.9019 19.5157 17.3958 17.226 19.8127C16.0606 21.0428 14.8987 22.043 14.0292 22.7354C13.5936 23.0822 13.2295 23.3534 12.9722 23.5392C12.8435 23.6321 12.7415 23.7038 12.6704 23.753C12.6349 23.7776 12.6072 23.7966 12.5877 23.8098L12.5648 23.8253L12.5581 23.8298L12.556 23.8312C12.5557 23.8314 12.5547 23.8321 12 23ZM12 23L12.5547 23.8321C12.2188 24.056 11.7807 24.0556 11.4448 23.8317L12 23Z M12 8C10.8954 8 10 8.89543 10 10C10 11.1046 10.8954 12 12 12C13.1046 12 14 11.1046 14 10C14 8.89543 13.1046 8 12 8ZM8 10C8 7.79086 9.79086 6 12 6C14.2091 6 16 7.79086 16 10C16 12.2091 14.2091 14 12 14C9.79086 14 8 12.2091 8 10Z',
            fillColor: '#0176D3',
            fillOpacity: 0.8,
            strokeWeight: 0,
            strokeColor: '#000',
            rotation: 0,
            scale: 1.2,
            // @ts-ignore
            anchor: new google.maps.Point(15, 30)
        }

        if (selected === true) {
            marker.fillColor = selectedColor
            marker.strokeColor = selectedColor
        }

        if (pin.storePinSVG) {
            marker.path = pin.storePinSVG
        }

        return marker
    }

    /**
     * @function generateMapPins
     * @description Function that generates the pins on the map
     * @param storeID - Store ID clicked (if it doesn't exist it's undefined)
     */
    const generateMapPins = useCallback(
        (storeID) => {
            if (isloaded !== true) {
                // for google maps api
                // @ts-ignore
                const bounds = new google.maps.LatLngBounds()

                if (pins) {
                    clearMarkers(prevMarkersRef.current) //clear prev markers
                    // @ts-ignore
                    let infowindow = new google.maps.InfoWindow()

                    prevMarkersRef.current = []

                    if (pins.length > 0) {
                        setPreviousPosition({lat: pins[0].latitude, lng: pins[0].longitude})
                    }

                    pins.forEach((pin) => {
                        // for google maps api
                        // @ts-ignore
                        const position = new google.maps.LatLng({
                            lat: pin.latitude,
                            lng: pin.longitude
                        })

                        // for google maps api
                        // @ts-ignore
                        var marker = new google.maps.Marker({
                            position,
                            icon:
                                storeID === pin.id
                                    ? buildMarker(pin, true)
                                    : buildMarker(pin, false),
                            map: Map,
                            clickable: pin.clickable,
                            storeID: pin.id
                        })

                        let mqSE = window.matchMedia('(max-width: 570px)')
                        let content = ``
                        if (mqSE.matches) {
                            content = `<div class="google-maps-window-info" style="text-align: left; padding: 0px 8px 8px 8px">`
                            // window width is at less than 570px
                        } else {
                            let mqIpad = window.matchMedia('(max-width: 812px)')
                            if (mqIpad.matches) {
                                content = `<div class="google-maps-window-info" style="text-align: left; padding: 2px 14px 8px 4px">`
                            } else {
                                content = `<div class="google-maps-window-info" style="text-align: left;">`
                            }
                        }

                        content += `<p><b>Store Name</b>: ${pin.name}</p>
                        <p><b>Store Address</b>: ${pin.address}</p>`

                        // append store phone property if exist
                        content +=
                            pin.phone !== undefined
                                ? `<p><b>Store Phone</b>: ${pin.phone} </p>`
                                : ``

                        // append store hours property if exist
                        content +=
                            pin.hours !== undefined ? `<p><b>Store Hours</b>: ${pin.hours}</p>` : ``

                        // close div content(popup)
                        content += `</div>`

                        // if is the selected marker
                        if (marker.icon.fillColor === selectedColor) {
                            infowindow.setContent(content)
                            infowindow.open(Map, marker)
                        }

                        // @ts-ignore
                        google.maps.event.addListener(marker, 'click', function () {
                            onClickMarkerStoreMap(this.storeID)
                        })

                        // for google maps api
                        // @ts-ignore
                        google.maps.event.addListener(Map, 'click', function () {
                            infowindow.close()
                        })

                        if (pin.unique === true) {
                            setIsloaded(true)
                            setIsUnique(true)
                        }

                        prevMarkersRef.current.push(marker)
                        bounds.extend(marker.getPosition())
                    })
                }

                if (isUnique || pins.length <= 2) {
                    Map.setZoom(6)
                }

                Map.fitBounds(bounds)

                // set previous position when we don't have any results
                if (pins.length === 0) {
                    let previousPlace = {lat: previousPosition.lat, lng: previousPosition.lng}
                    Map.setCenter(previousPlace)
                }
            }
        },
        [pins, Map]
    )

    useEffect(() => {
        if (!Map) {
            if (mapRef.current) {
                // if else to better visibility
                if (pins[0]?.unique === true) {
                    setMap(
                        // for google maps api
                        // @ts-ignore
                        new window.google.maps.Map(mapRef.current, {
                            zoom: 12,
                            center: {
                                lat: pins[0].latitude,
                                lng: pins[0].longitude
                            },
                            disableDoubleClickZoom: true
                        })
                    )
                } else {
                    setMap(
                        // for google maps api
                        // @ts-ignore
                        new window.google.maps.Map(mapRef.current, {
                            zoom: 4
                        })
                    )
                }
            }
        }

        if (Map) {
            if (storeID) {
                for (let marker of prevMarkersRef.current) {
                    if (marker.storeID === storeID) {
                        generateMapPins(storeID)
                        break
                    }
                }
            } else {
                generateMapPins(null)
            }
        }
    }, [Map, generateMapPins, storeID])

    return (
        <>
            <AspectRatio minHeight={{base: '650px', md: '530px', lg: '650px'}} ratio={4 / 3}>
                <Box
                    minHeight={{base: '650px', md: '530px', lg: '650px'}}
                    position={'initial'}
                    ref={mapRef}
                    color={'black'}
                ></Box>
            </AspectRatio>
        </>
    )
}

export default Map
