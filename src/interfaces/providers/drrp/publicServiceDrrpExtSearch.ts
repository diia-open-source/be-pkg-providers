import { DrrpError, MortgageExt, PropertyCommonKind, RealtyAddress, RealtyLimitationExt, RealtyType } from '.'

export enum DrrpSearchType {
    Object = '1',
    Subject = '2',
}

export enum DrrpSearchAlgorithm {
    Partial = '1',
    Complete = '2',
}

export enum DcSbjType {
    Individual = '1',
    Entity = '2',
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
    dcSearchAlgorithm?: DrrpSearchAlgorithm
    dcSbjRlNames?: string
}

export interface PublicServiceDrrpSubjectRequest {
    isShowHistoricalNames: boolean
    searchType: DrrpSearchType.Subject
    subjectSearchInfo: DrrpSearchSubjectInfo
}

export enum DcGroupType {
    Apartment = '1',
    LandPlot = '2',
}

export enum DcHouseType {
    House = '1',
}

export enum DcBuildingType {
    Building = '1',
    Section = '2',
}

export enum DcObjectNumType {
    Apartment = '2',
    Room = '3',
    Block = '5',
    Section = '6',
}

export enum DcRoomType {
    Room = '1',
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
    realtyRnNum: string
}

export interface PublicServiceDrrpObjectRequest {
    isShowHistoricalNames: boolean
    searchType: DrrpSearchType.Object
    objectSearchInfo: DrrpSearchObjectInfo
}

export interface RealtySubject {
    sbjName: string
    sbjCode?: string
    dcSbjType: DcSbjType
    country: string
    idEddr?: string
    idDoc?: {
        dcSidType: string
        publisher: string
        docDate: string // ISO
        seriesNum: string
    }
}

export interface RealtyCauseDocument {
    cdType: string
    docDate: string
    publisher: string
    enum: string
}

export interface RealtyProperty {
    rnNum: number
    regDate: string
    partSize?: string
    prKind: string
    prCommonKind?: PropertyCommonKind | string
    prType?: string
    prState: string
    registrar: string
    entityLinks?: unknown[]
    operationReason?: string
    subjects: RealtySubject[]
    causeDocuments: RealtyCauseDocument[]
}

export interface Realty {
    area: number
    livingArea: number
    regNum: string
    isResidentialBuilding: string
    regDate: string
    techDescription: string
    reType: RealtyType | string
    reTypeOnm?: string
    reState: string
    sectionType: string
    region: string
    properties: RealtyProperty[]
    realtyAddress: RealtyAddress[]
    limitation?: RealtyLimitationExt[]
    mortgage?: MortgageExt[]
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
