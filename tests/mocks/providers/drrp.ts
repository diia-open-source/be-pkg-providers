import {
    DcBuildingType,
    DcGroupType,
    DcHouseType,
    DcObjectNumType,
    DcSbjType,
    DrrpGroupResultItem,
    PropertyState,
    Realty,
    RealtyExt,
    RealtyProperty,
    RealtyState,
    RealtySubject,
    RealtyType,
    SubjectInfoClarifyingResult,
    SubjectInfoResult,
} from '../../../src/interfaces/providers'

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
            reState: RealtyState.Active,
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
                    prState: PropertyState.Active,
                    registrar: 'John Doe',
                    entityLinks: [],
                    subjects: [
                        {
                            sbjName: 'Jane Smith',
                            dcSbjType: DcSbjType.Individual,
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

    return {
        realty,
        oldRealty: [],
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

export function getRealtyProperty(data: Partial<RealtyProperty> = {}, sbjCode = '1233434'): RealtyProperty {
    return {
        rnNum: 1,
        regDate: '2022-02-25',
        prKind: 'ownership',
        prType: 'apartment',
        prState: PropertyState.Active,
        registrar: 'John Doe',
        entityLinks: [],
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
        reState: RealtyState.Active,
        dcReTypeOnm: '1',
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
