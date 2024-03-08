import {
    DcBuildingType,
    DcGroupType,
    DcHouseType,
    DcObjectNumType,
    DcSbjType,
    DcSbjTypeExt,
    DrrpGroupResultItem,
    OldRealtyExt,
    Realty,
    RealtyExt,
    RealtyProperty,
    RealtySubject,
    RealtyType,
    SubjectInfoClarifyingResult,
    SubjectInfoResult,
} from '../../../src/interfaces/providers/drrp'

export function getSubjectInfoResponse(items: DrrpGroupResultItem[] = []): SubjectInfoResult {
    return {
        reportResultID: 12345,
        groupResult: [
            {
                ID: 1,
                dcGroupType: DcGroupType.Apartment,
                name: 'Apartment 101',
                addressDetail: [
                    {
                        atuAtuID: 123,
                        house: '1',
                        dcHouseType: DcHouseType.House,
                        building: 'A',
                        dcBuildingType: DcBuildingType.Building,
                        objectNum: '101',
                        dcObjectNumType: DcObjectNumType.Apartment,
                    },
                ],
            },
            {
                ID: 2,
                dcGroupType: DcGroupType.LandPlot,
                name: 'LandPlot 101',
                addressDetail: [
                    {
                        atuAtuID: 123,
                        house: '1',
                        dcHouseType: DcHouseType.House,
                        building: 'A',
                        dcBuildingType: DcBuildingType.Building,
                        objectNum: '101',
                        dcObjectNumType: DcObjectNumType.Apartment,
                    },
                ],
            },
            ...items,
        ],
    }
}

export function getSubjectInfoGroupResultItem(data: Partial<DrrpGroupResultItem> = {}): DrrpGroupResultItem {
    return {
        ID: 1,
        dcGroupType: DcGroupType.Apartment,
        name: 'Apartment 101',
        addressDetail: [
            {
                atuAtuID: 123,
                house: '1',
                dcHouseType: DcHouseType.House,
                building: 'A',
                dcBuildingType: DcBuildingType.Building,
                objectNum: '101',
                dcObjectNumType: DcObjectNumType.Apartment,
            },
        ],
        ...data,
    }
}

export function getSubjectInfoClarifyingResponse(data: Partial<RealtyExt> = {}): SubjectInfoClarifyingResult {
    const realty: RealtyExt[] = [
        {
            regNum: '123',
            regDate: '2022-02-25',
            reType: RealtyType.Apartment,
            reState: 'active',
            sectionType: 'residential',
            region: 'Kyiv',
            area: 40,
            hasProperties: 1,
            properties: [
                {
                    rnNum: 1,
                    regDate: '2022-02-25',
                    prKind: 'ownership',
                    prType: 'apartment',
                    prState: 'active',
                    registrar: 'John Doe',
                    entityLinks: [],
                    operationReason: 'sale',
                    subjects: [
                        {
                            sbjName: 'Jane Smith',
                            dcSbjType: DcSbjTypeExt.Individual,
                            country: 'Ukraine',
                        },
                    ],
                    causeDocuments: [
                        {
                            cdType: 'contract',
                            docDate: '2022-02-25',
                            publisher: 'Some Company',
                            enum: '123456',
                        },
                    ],
                },
            ],
            realtyAddress: [
                {
                    addressDetail: 'Some Address',
                },
            ],
            ...data,
        },
    ]

    const oldRealty: OldRealtyExt[] = [
        {
            RE_ID: 1,
            RE_TYPENAME: 'Apartment',
            ADDITIONAL: 'Some Additional Info',
            RC_APPL: 'Some Application Info',
            owners: [
                {
                    DC_SBJ_TYPE: '1',
                    RESHDATE: '2022-02-25',
                    NAME: 'John Smith',
                    CODE: '123456',
                    OSPART: 'Some Part Info',
                    links: [
                        {
                            R_PR_RN_NUM: '1',
                            R_DATE: '2022-02-25',
                        },
                    ],
                },
            ],
        },
    ]

    return {
        realty,
        oldRealty,
    }
}

export function getRealtySubject(data: Partial<RealtySubject> = {}): RealtySubject {
    return {
        sbjName: 'Jane Smith',
        sbjCode: '1233434',
        dcSbjType: DcSbjType.Individual,
        country: 'Ukraine',
        ...data,
    }
}

export function getRealtyProperty(data: Partial<RealtyProperty> = {}, sbjCode?: string): RealtyProperty {
    return {
        rnNum: 1,
        regDate: '2022-02-25',
        prKind: 'ownership',
        prType: 'apartment',
        prState: 'active',
        registrar: 'John Doe',
        entityLinks: [],
        operationReason: 'sale',
        partSize: '1',
        subjects: [getRealtySubject({ sbjCode })],
        causeDocuments: [
            {
                cdType: 'contract',
                docDate: '2022-02-25',
                publisher: 'Some Company',
                enum: '123456',
            },
        ],
        ...data,
    }
}

export function getRealty(data: Partial<Realty> = {}): Realty {
    return {
        area: 2,
        livingArea: 3,
        regNum: 'regNum',
        isResidentialBuilding: '1',
        regDate: 'regDate',
        techDescription: 'techDescription',
        reType: 'reType',
        reState: 'reState',
        sectionType: 'sectionType',
        region: 'Kyiv',
        properties: [getRealtyProperty()],
        realtyAddress: [
            {
                addressDetail: 'Some Address',
            },
        ],
        ...data,
    }
}
