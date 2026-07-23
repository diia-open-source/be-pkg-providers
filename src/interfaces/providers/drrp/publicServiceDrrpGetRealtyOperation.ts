import {
    RealtyAddress,
    RealtyGroundArea,
    RealtyIrp,
    RealtyLimitation,
    RealtyMortgage,
    RealtyOperation,
    RealtyProperty,
    RealtyState,
    RealtyType,
} from './index.js'

export interface PublicServiceDrrpGetRealtyOperationRequest {
    realtyRnNum?: string
    mgRnNum?: string
    lmRnNum?: string
    prRnNum?: string
    irpRnNum?: string
}

export interface RealtyOperationProperty extends RealtyProperty {
    cost?: number
    prModeBit?: string
    ownModeAdditional?: string
    ownAdditional?: string
    opDate?: string
    dcOpReasonType?: string
    OpReasonType?: string
    opReason?: string
    operations: RealtyOperation[]
}

export interface RealtyOperationMortgage extends RealtyMortgage {
    operations: RealtyOperation[]
}

export interface RealtyOperationLimitation extends RealtyLimitation {
    operations: RealtyOperation[]
}

export interface GetRealtyOperationMgRnNumResultData {
    mortgage?: RealtyOperationMortgage[]
}

export interface GetRealtyOperationLmRnNumResultData {
    limitation?: RealtyOperationLimitation[]
}

export interface GetRealtyOperationIrpRnNumResultData {
    irps?: RealtyIrp[]
}

export interface GetRealtyOperationRealtyRnNumResultData {
    regNum: string
    regDate: string // ISO
    dcReTypeOnm: string
    reType: RealtyType | string
    reTypeExtension?: string
    reSubType?: string
    reSubTypeExtension?: string
    Cost?: number
    isResidentialBuilding?: string
    reState: RealtyState
    opDate: string
    dcOpReasonType?: string
    OpReasonType?: string
    OpReason?: string
    sectionType: string
    region: string
    techDescription?: string
    area?: number
    livingArea?: number
    readinessPercent?: number
    objectIdentifier?: string
    sbjName?: string
    sbjRegDate?: string
    sbjCode?: string
    additional?: string
    realtyAddress?: RealtyAddress
    groundArea?: RealtyGroundArea[]
    operations: RealtyOperation[]
}

export type PublicServiceDrrpGetRealtyOperationResponse =
    | { prRnNum?: string; resultData: RealtyOperationProperty }
    | { realtyRnNum?: string; resultData: GetRealtyOperationRealtyRnNumResultData }
    | { mgRnNum?: string; resultData: GetRealtyOperationMgRnNumResultData }
    | { lmRnNum?: string; resultData: GetRealtyOperationLmRnNumResultData }
    | { irpRnNum?: string; resultData: GetRealtyOperationIrpRnNumResultData }
