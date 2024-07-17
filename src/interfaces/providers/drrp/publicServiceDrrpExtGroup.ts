import { DrrpError, RealtyAddress, RealtyLimitation, RealtyMortgage, RealtyProperty, RealtyState, RealtyType } from '.'

export interface PublicServiceDrrpExtGroupRequest {
    entity: 'rrpExch_external'
    method: 'generate'
    reportResultID: number
    groupID: number
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
    reState: RealtyState
    sectionType: string
    region: string
    techDescription?: string
    area?: number
    livingArea?: number
    wallMaterial?: string
    depreciationPercent?: number
    selfBuildArea?: number
    hasProperties: number
    properties: RealtyProperty[]
    realtyAddress: RealtyAddress[]
    limitation?: RealtyLimitation[]
    mortgage?: RealtyMortgage[]
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
    oldRealty: unknown[]
    oldMortgageJson: unknown[]
    oldLimitationJson: unknown[]
    allAdresses: unknown[]
}

export interface SubjectInfoClarifyingResult {
    realty: RealtyExt[]
    oldRealty: unknown[]
}
