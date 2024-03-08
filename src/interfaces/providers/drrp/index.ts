export * from './publicServiceDrrpExtGroup'

export * from './publicServiceDrrpExtSearch'

export * from './publicServiceDrrpGetActualAtu'

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

export enum PropertyCommonKind {
    CommonShared = 'спільна сумісна',
    CommonPartial = 'спільна часткова',
}

export enum OwnershipType {
    Single = 'single',
    CommonShared = 'commonShared',
    CommonPartial = 'commonPartial',
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

export interface DrrpError {
    message: string
    code: number
}

export interface RealtyAddress {
    addressDetail: string
}

export interface PropertyOwnerInfo {
    fullName: string
    rnokpp: string
    rnNum: number
    partSize?: string
    prCommonKind?: PropertyCommonKind | string
}
