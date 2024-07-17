export enum RealtyType {
    PrivateHouse = 'житловий будинок',
    Apartment = 'квартира',
    LivingSpace = 'житлове приміщення',
    Building = 'будівля',
    LinearInfrastructureObject = "лінійний об'єкт інфраструктури",
    UnfinishedConstruction = 'незавершене будівництво',
    Hostel = 'гуртожиток',
    Structure = 'споруда',
    NonLivingSpace = 'нежитлове приміщення',
    ApartmentBuilding = 'багатоквартирний будинок',
    CountryHouse = 'дачний будинок',
    GardenHouse = 'садовий будинок',
    Farmstead = 'садиба',
    LandPlot = 'земельна ділянка',
    SinglePropertyComplex = 'єдиний майновий комплекс',
    IntegralPropertyComplex = 'цілісний майновий комплекс',
    Parking = 'машиномісце/паркомісце',
    Garage = 'гаражний бокс',
    Quartets = 'приміщення',
    Room = 'кімната',
    LivingGardenHouse = 'житловий будинок садибного типу',
}

export enum RealtyState {
    Active = 'зареєстровано',
    Closed = 'закрито',
    Aborted = 'скасовано/анульовано',
}

export enum PropertyState {
    Active = 'зареєстровано',
    Stopped = 'припинено',
    Repaid = 'погашено',
    Aborted = 'скасовано/анульовано',
}

export enum MortgageState {
    Active = 'зареєстровано',
    Stopped = 'припинено',
    Repaid = 'погашено',
    Aborted = 'скасовано/анульовано',
}

export enum PropertyCommonKind {
    CommonShared = 'спільна сумісна',
    CommonPartial = 'спільна часткова',
}

export enum OwnershipType {
    Single = 'single',
    CommonShared = 'commonShared',
    CommonPartial = 'commonPartial',
}

export enum DcSbjType {
    Individual = '1',
    Entity = '2',
}

export enum ExternalEvent {
    PublicServiceDrrpExtGroup = 'public-service.drrp-extgroup',
    PublicServiceDrrpExtSearch = 'public-service.drrp-extsearch',
    PublicServiceDrrpGetActualAtu = 'public-service.drrp-getactualatu',
}

export interface DrrpConfig {
    timeout?: number
    extSearchTimeout?: number
    unavailableProcessCode?: number
}

export interface DrrpRequestOptions {
    timeout?: number
    unavailableProcessCode?: number
}

export interface DrrpExtSearchRequestOptions extends DrrpRequestOptions {
    isSuspend?: boolean
}

export interface DrrpError {
    message: string
    code: number
}

export interface RealtyAddress {
    addressDetail: string
}

export interface RealtyProperty {
    rnNum: number
    regDate: string // ISO
    partSize?: string
    prKind: string
    prCommonKind?: PropertyCommonKind | string
    prType?: string
    prState: PropertyState
    registrar: string
    subjects: RealtySubject[]
    entityLinks: (RealtyEntityLink & { linkPrRnNum?: string })[]
    causeDocuments: RealtyCauseDocument[]
}

export interface RealtyMortgage {
    rnNum: number
    regDate: string // ISO
    registrar: string
    additional?: string
    MgState?: MortgageState
    propertyRights: RealtyPropertyRights[]
    subjects: RealtySubject[]
    causeDocuments: RealtyCauseDocument[]
    entityLinks: (RealtyEntityLink & { linkMgRnNum?: string })[]
}

export interface RealtyLimitation {
    rnNum: number
    regDate: string // ISO
    registrar: string
    LmType: string
    LmTypeExtension?: string
    LmDescription?: string
    execTerm?: string
    actTermText?: string
    actTerm?: string // ISO
    OligationSum?: number
    CurrencyType?: string
    propertyRights: RealtyPropertyRights[]
    subjects: RealtySubject[]
    causeDocuments: RealtyCauseDocument[]
    entityLinks: (RealtyEntityLink & { linkLmRnNum?: string })[]
}

export interface RealtySubject {
    dcSbjType: DcSbjType
    sbjAddType?: string
    sbjName: string // optional
    sbjCode?: string
    sbjRlName?: string
    country?: string
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
    cdTypeExtension?: string
    docDate?: string // ISO
    expirationDate?: string // ISO
    publisher: string
    enum: string
    additional?: string
}

export interface RealtyEntityLink {
    registryType?: string
    registryTypeExtension?: string
    roOpID?: string
    otherRegNum?: string
    oldRegDate?: string // ISO
    linkRegDate?: string // ISO
}

export interface RealtyPropertyRights {
    irpRnNum?: number
    irpSort?: string
    propertyDescription?: string
}

export interface PropertyOwnerInfo {
    fullName: string
    rnokpp: string
    rnNum: number
    partSize?: string
    prCommonKind?: PropertyCommonKind | string
}
