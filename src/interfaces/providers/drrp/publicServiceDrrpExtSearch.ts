import { DrrpError, RealtyAddress, RealtyLimitation, RealtyMortgage, RealtyProperty, RealtyState, RealtyType } from '.'

export enum DrrpSearchType {
    Object = '1',
    Subject = '2',
}

export enum DrrpSearchAlgorithm {
    Partial = '1',
    Complete = '2',
}

export interface PublicServiceDrrpExtSearchRequest {
    entity: 'rrpExch_external'
    method: 'search'
    searchParams: PublicServiceDrrpSubjectRequest | PublicServiceDrrpObjectRequest
}

export interface PublicServiceDrrpExtSearchResponse {
    entity: 'rrpExch_external'
    method: 'search'
    resultID: number
    ID: number
    resultData: string
    resultMessage?: string
}

export interface DrrpSearchSubjectInfo {
    sbjType: string
    sbjName?: string
    sbjCode?: string
    seriesNum?: string
    idEddr?: string
    codeAbsence?: string
    dcSearchAlgorithm?: DrrpSearchAlgorithm
    dcSbjRlNames?: string
}

export interface PublicServiceDrrpSubjectRequest {
    isShowHistoricalNames: boolean
    isSuspend?: boolean
    searchType: DrrpSearchType.Subject
    subjectSearchInfo: DrrpSearchSubjectInfo
}

export enum DcGroupType {
    Apartment = '1',
    LandPlot = '2',
}

export enum DcHouseType {
    House = '1',
    LandPlot = '2',
}

export enum DcBuildingType {
    Building = '1',
    Section = '2',
}

export enum DcObjectNumType {
    Garage = '1',
    Apartment = '2',
    Room = '3',
    Quartets = '4',
    Block = '5',
    Section = '6',
}

export enum DcRoomType {
    Room = '1',
    Quartets = '2',
}

export interface DrrpGroupResultItem {
    ID: number
    dcGroupType: DcGroupType
    name: string
    addressDetail?: DrrpGroupResultAddressDetail[]
}

export interface DrrpGroupResultAddressDetail {
    atuAtuID: number
    house?: string
    dcHouseType?: DcHouseType | string
    building?: string
    dcBuildingType?: DcBuildingType | string
    objectNum?: string
    dcObjectNumType?: DcObjectNumType | string
    room?: string
    dcRoomType?: DcRoomType | string
}

interface PublicServiceDrrpSubjectFailedResponse {
    error: DrrpError
}

interface PublicServiceDrrpSubjectSuccessResponse {
    reportResultID: number
    groupResult: DrrpGroupResultItem[]
}

export type PublicServiceDrrpSubjectResponse = PublicServiceDrrpSubjectFailedResponse | PublicServiceDrrpSubjectSuccessResponse

export interface DrrpSearchObjectInfo {
    realtyRnNum?: string
    cadNum?: string
    objectIdentifier?: string
    realtyAddressInfo?: {
        atuID?: number
        houseType?: DcHouseType
        house?: string
        buildingType?: DcBuildingType
        building?: string
        objectNumType?: string
        objectNum?: string
        roomType?: string
        room?: string
    }
}

export interface PublicServiceDrrpObjectRequest {
    isShowHistoricalNames: boolean
    isSuspend?: boolean
    searchType: DrrpSearchType.Object
    objectSearchInfo: DrrpSearchObjectInfo
}

export interface Realty {
    regNum: string
    regDate: string // ISO
    dcReTypeOnm: string
    reType: RealtyType | string
    reTypeExtension?: string
    reSubType?: string
    reSubTypeExtension?: string
    reState: RealtyState
    Cost?: number
    isResidentialBuilding: '0' | '1'
    sectionType: string
    region: string
    techDescription?: string
    area?: number
    livingArea?: number
    readinessPercent?: number
    objectIdentifier?: string
    additional?: string
    properties: RealtyProperty[]
    realtyAddress: RealtyAddress[]
    limitation?: RealtyLimitation[]
    mortgage?: RealtyMortgage[]
}

export interface PublicServiceDrrpObjectResponse {
    realty: Realty[]
    oldRealty: unknown[]
    oldMortgageJson: unknown[]
    oldLimitationJson: unknown[]
}

export interface SubjectInfoResult {
    reportResultID: number
    groupResult: DrrpGroupResultItem[]
}
