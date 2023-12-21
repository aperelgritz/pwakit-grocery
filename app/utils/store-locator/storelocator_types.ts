
export interface IStoreInformation {
    id: string
    name: String
    phone: String
    address1: String
    latitude: string
    longitude: string
    addressLine: String
    store_hours: string
    city: string
    postal_code: string
    state: string,
    c_storePinSVG: string,
    c_services: [],
    email: string
}

export interface IStoreInformationArray {
    stores: IStoreInformation[]
}

export interface StoreCardInformation {
    searchTerm: string
    handleStoreArray(isEmpty: boolean): void
    numberStoresFound(arrayLenght: number, stores: Array<Object>): void
    stores: IStoreInformation[]
}

export interface IStoreBreadCrumb {
    home: boolean
    storeName: string
}

export interface IStoreImage {
    image: string,
    alt: string
}

export type MapPin = {
    longitude: number
    latitude: number
    name: string
    address: string
    id: string
    clickable: boolean
    unique: boolean
    storePinSVG: string
    phone: string
    hours: string
}

export interface GoogleMapProps {
    pins: MapPin[]
    apiKey: string
}

export interface IStoreSearch {
    handleStoreSearch(arg: string): void
    handleStoreEmpty(): void
    getStoresByUserLocation(): void
    numberOfStores: number
    numberOfStoresNearMe: number
}

export interface ContentAsset {
    contentAssetName: String
    contentAssetBody: string
}