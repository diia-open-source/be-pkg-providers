import { DrrpError, PropertyCommonKind, RealtyAddress, RealtyType } from '.'

export interface PublicServiceDrrpExtGroupRequest {
    entity: 'rrpExch_external'
    method: 'generate'
    reportResultID: number
    groupID: number
}

export enum DcSbjTypeExt {
    Individual = '1',
    Entity = '2',
}

export enum RealtyLimitationExtType {
    Ban = '1',
    Arrest = '2',
}

export interface RealtySubjectExt {
    sbjName: string
    sbjCode?: string
    dcSbjType: DcSbjTypeExt
    country: string
}

export interface RealtyCauseDocumentExt {
    cdType: string
    docDate: string
    publisher: string
    enum: string
}

export interface RealtyPropertiesExt {
    rnNum: number
    regDate: string
    partSize?: string
    prKind: string
    prCommonKind?: PropertyCommonKind | string
    prType: string
    prState: string
    registrar: string
    entityLinks: unknown[]
    operationReason: string
    subjects?: RealtySubjectExt[]
    causeDocuments?: RealtyCauseDocumentExt[]
}

export interface RealtyLimitationExt {
    rnNum: number
    LmType: RealtyLimitationExtType | string
    operationReason?: string
    LmTypeExtension?: string
    regDate: string
    holderObj: string
    LmDescription?: string
    execTerm?: string
    actTermText?: string
    actTerm?: string
    OligationSum?: number
    CurrencyType?: string
    subjects: unknown[]
    causeDocuments: unknown[]
    entityLinks: unknown[]
}

export interface MortgageExt {
    rnNum: number
    regDate: string
    holderObj?: string
    mgState?: string
    obligations: unknown[]
}

export interface RealtyExt {
    regNum: string
    regDate: string
    reType: RealtyType | string
    reTypeOnm?: string
    reTypeExtension?: string
    reSubType?: string
    reSubTypeExtension?: string
    reInCreation?: string
    isResidentialBuilding?: string
    reState: string
    sectionType: string
    region: string
    techDescription?: string
    area?: number
    livingArea?: number
    wallMaterial?: string
    depreciationPercent?: number
    selfBuildArea?: number
    hasProperties: number
    properties: RealtyPropertiesExt[]
    realtyAddress: RealtyAddress[]
    limitation?: RealtyLimitationExt[]
    mortgage?: MortgageExt[]
}

export interface OldRealtyExt {
    RE_ID: number
    RE_TYPENAME: string
    ADDITIONAL?: string
    RC_APPL?: string
    RE_LAND_TYPE?: string
    RE_LAND_TYPE_EXTENSION?: string
    CAD_NUM?: string
    AREA_ALL?: string
    AREA_HAB?: string
    BUILD_FROM?: string
    PLOT_AREA?: string
    DESTROY_PERCENT?: string
    CUR_PRICE?: string
    SELF_BUILD_AREA?: string
    SELF_BUILD_PRICE?: string
    TEXT_BODY?: string
    REG_NUM?: string
    BOOK_NUM?: string
    ADD_DATE?: string
    ADD_REASON?: string
    PROPADDRESS?: string
    DATE_OPEN?: string
    owners: {
        DC_SBJ_TYPE: string
        RESHDATE: string
        NAME: string
        CODE?: string
        OSOW_TYPE?: string
        OSPART?: string
        PVDOC?: string
        links?: {
            R_PR_RN_NUM?: string
            R_DATE?: string
        }[]
    }[]
    opers?: unknown[]
}

export interface PublicServiceDrrpExtGroupResponse {
    entity: 'rrpExch_external'
    method: 'generate'
    reportResultID: number
    groupID: number
    resultID: number
    ID: number
    resultData: string
    resultMessage?: string
}

export interface PublicServiceDrrpExtGroupResult {
    error?: DrrpError
    realty: RealtyExt[]
    oldRealty: OldRealtyExt[]
    oldMortgageJson: unknown[]
    oldLimitationJson: unknown[]
    allAdresses: unknown[]
}

export interface SubjectInfoClarifyingResult {
    realty: RealtyExt[]
    oldRealty: OldRealtyExt[]
}
