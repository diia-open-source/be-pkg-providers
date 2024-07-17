import { mock } from 'jest-mock-extended'

import DiiaLogger from '@diia-inhouse/diia-logger'
import { ExternalCommunicator } from '@diia-inhouse/diia-queue'
import { InternalServerError, ServiceUnavailableError } from '@diia-inhouse/errors'

import {
    DcSbjType,
    DrrpSearchType,
    OwnershipType,
    PropertyCommonKind,
    PropertyOwnerInfo,
    PublicServiceDrrpActualAtuIdResponse,
    PublicServiceDrrpObjectResponse,
    RealtyProperty,
} from '../../src'
import { ExternalEvent } from '../../src/interfaces/providers/drrp'
import { DrrpProvider } from '../../src/providers'
import { drrpExtGroupResultValidationSchema, drrpExtSearchResultValidationSchema } from '../../src/validation/drrp'
import { getRealty, getRealtyProperty, getRealtySubject } from '../mocks/providers/drrp'

interface IsSoleOwnerTestParams {
    description: string
    owners: Pick<RealtyProperty, 'prCommonKind' | 'subjects' | 'partSize'>[]
    expected: boolean
}

interface IsInvalidOwnersDataTestParams {
    description: string
    properties: RealtyProperty[]
    expected: boolean
}

interface GetOwnershipTypeTestParams {
    description: string
    properties: RealtyProperty[]
    expected: OwnershipType
}

describe(`${DrrpProvider.name}`, () => {
    const logger = new DiiaLogger()
    const external = mock<ExternalCommunicator>()

    const drrpProvider = new DrrpProvider(logger, external)

    describe('getActualAtuId', () => {
        it('should return same atuId if no actual atuId returned', async () => {
            const atuId = 42

            const mockResponse: PublicServiceDrrpActualAtuIdResponse = { atuID: atuId, actualAtuID: undefined }

            jest.spyOn(external, 'receiveDirect').mockResolvedValueOnce(mockResponse)

            const result = await drrpProvider.getActualAtuId(atuId)

            expect(result).toBe(atuId)
        })

        it('should return same atuId if empty response', async () => {
            const atuId = 42

            jest.spyOn(external, 'receiveDirect').mockResolvedValueOnce(null)

            const result = await drrpProvider.getActualAtuId(atuId)

            expect(result).toBe(atuId)
        })

        it('should return biggest atuId if received actual atuIds', async () => {
            const atuId = 42
            const actualAtuId = 123

            const mockResponse: PublicServiceDrrpActualAtuIdResponse = { atuID: atuId, actualAtuID: [atuId, actualAtuId] }

            jest.spyOn(external, 'receiveDirect').mockResolvedValueOnce(mockResponse)

            const result = await drrpProvider.getActualAtuId(atuId)

            expect(result).toBe(actualAtuId)
        })

        it('should throw ServiceUnavailableError for connection issue', async () => {
            const atuId = 42

            jest.spyOn(external, 'receiveDirect').mockRejectedValueOnce(new Error('Error'))

            await expect(drrpProvider.getActualAtuId(atuId)).rejects.toThrow(ServiceUnavailableError)
        })
    })

    describe('getActualAtuIds', () => {
        it('should return array with same atuId if no actual atuId returned', async () => {
            const atuId = 42

            const mockResponse: PublicServiceDrrpActualAtuIdResponse = { atuID: atuId, actualAtuID: undefined }

            jest.spyOn(external, 'receiveDirect').mockResolvedValueOnce(mockResponse)

            const result = await drrpProvider.getActualAtuIds(atuId)

            expect(result).toStrictEqual([atuId])
        })

        it('should return array with same atuId if empty response', async () => {
            const atuId = 42

            jest.spyOn(external, 'receiveDirect').mockResolvedValueOnce(null)

            const result = await drrpProvider.getActualAtuIds(atuId)

            expect(result).toStrictEqual([atuId])
        })

        it('should return array with same atuId if response actualAtuID is empty', async () => {
            const atuId = 42

            const actualAtuID: number[] = []

            const mockResponse: PublicServiceDrrpActualAtuIdResponse = { atuID: atuId, actualAtuID }

            jest.spyOn(external, 'receiveDirect').mockResolvedValueOnce(mockResponse)

            const result = await drrpProvider.getActualAtuIds(atuId)

            expect(result).toStrictEqual([atuId])
        })

        it('should return array with actual atuIds if response actualAtuID is not empty', async () => {
            const atuId = 42
            const actualAtuId = 123

            const actualAtuID = [atuId, actualAtuId]

            const mockResponse: PublicServiceDrrpActualAtuIdResponse = { atuID: atuId, actualAtuID }

            jest.spyOn(external, 'receiveDirect').mockResolvedValueOnce(mockResponse)

            const result = await drrpProvider.getActualAtuIds(atuId)

            expect(result).toStrictEqual(actualAtuID)
        })
    })

    describe('getObjectInfo', () => {
        it('should return realty', async () => {
            const mockRealty = {
                area: 1,
                livingArea: 1,
                regNum: 'string',
                isResidentialBuilding: 'string',
                regDate: 'string',
                techDescription: 'string',
                reType: 'string',
                reState: 'string',
                sectionType: 'string',
                region: 'string',
                properties: [],
                realtyAddress: [],
            }

            const mockResponse = {
                resultData: JSON.stringify({
                    realty: [mockRealty],
                }),
            }

            jest.spyOn(external, 'receiveDirect').mockResolvedValueOnce(<PublicServiceDrrpObjectResponse>(<unknown>mockResponse))

            const id = '1'

            const result = await drrpProvider.getObjectInfo(id)

            expect(result).toStrictEqual(mockRealty)
        })

        it('should throw ServiceUnavailableError for incorrect data', async () => {
            const mockResponse = {
                resultData: {},
            }

            jest.spyOn(external, 'receiveDirect').mockResolvedValueOnce(<PublicServiceDrrpObjectResponse>(<unknown>mockResponse))

            const id = '1'

            await expect(drrpProvider.getObjectInfo(id)).rejects.toThrow(ServiceUnavailableError)
        })

        it('should throw ServiceUnavailableError for empty response', async () => {
            jest.spyOn(external, 'receiveDirect').mockResolvedValueOnce(<PublicServiceDrrpObjectResponse>(<unknown>undefined))

            const id = '1'

            await expect(drrpProvider.getObjectInfo(id)).rejects.toThrow(ServiceUnavailableError)
        })

        it('should return undefined for empty reality', async () => {
            const mockResponse = {
                resultData: JSON.stringify({
                    realty: [],
                }),
            }

            jest.spyOn(external, 'receiveDirect').mockResolvedValueOnce(<PublicServiceDrrpObjectResponse>(<unknown>mockResponse))

            const id = '1'

            const result = await drrpProvider.getObjectInfo(id)

            expect(result).toBeUndefined()
        })
    })

    describe('checkOwnersShares', () => {
        it.each([
            { owners: [], expected: false },
            { owners: [{ partSize: '0', prCommonKind: PropertyCommonKind.CommonShared }], expected: true },
            { owners: [{ partSize: '1', prCommonKind: PropertyCommonKind.CommonPartial }], expected: true },
            {
                owners: [
                    { partSize: '1/2', prCommonKind: PropertyCommonKind.CommonPartial },
                    { partSize: '1/2', prCommonKind: PropertyCommonKind.CommonPartial },
                ],
                expected: true,
            },
            { owners: [{ partSize: '0', prCommonKind: PropertyCommonKind.CommonPartial }], expected: false },
        ])('countPartSizeSum', ({ owners, expected }) => {
            const result = drrpProvider.checkOwnersShares(<Pick<RealtyProperty, 'partSize' | 'prCommonKind'>[]>(<unknown>owners))

            expect(result).toBe(expected)
        })

        it('should throw InternalServerError if unknown prCommonKind', () => {
            const owners = [{ partSize: 0, prCommonKind: 1 }]

            expect(() => drrpProvider.checkOwnersShares(<Pick<RealtyProperty, 'partSize' | 'prCommonKind'>[]>(<unknown>owners))).toThrow(
                InternalServerError,
            )
        })
    })

    describe('isSoleOwner', () => {
        const testParams: IsSoleOwnerTestParams[] = [
            {
                description: 'no owners',
                owners: [],
                expected: false,
            },
            {
                description: 'common partial, one owner and missing part sizes',
                owners: [
                    {
                        prCommonKind: PropertyCommonKind.CommonPartial,
                        partSize: '1/3',
                        subjects: [getRealtySubject()],
                    },
                ],
                expected: false,
            },
            {
                description: 'common partial, several owners',
                owners: [
                    {
                        prCommonKind: PropertyCommonKind.CommonPartial,
                        partSize: '2/3',
                        subjects: [getRealtySubject({ sbjCode: '1111110000' })],
                    },
                    {
                        prCommonKind: PropertyCommonKind.CommonPartial,
                        partSize: '1/3',
                        subjects: [getRealtySubject()],
                    },
                ],
                expected: false,
            },
            {
                description: 'common partial, one owner and all part sizes',
                owners: [
                    {
                        prCommonKind: PropertyCommonKind.CommonPartial,
                        partSize: '2/3',
                        subjects: [getRealtySubject()],
                    },
                    {
                        prCommonKind: PropertyCommonKind.CommonPartial,
                        partSize: '1/3',
                        subjects: [getRealtySubject()],
                    },
                ],
                expected: true,
            },
            {
                description: 'common shared, one owner',
                owners: [
                    {
                        prCommonKind: PropertyCommonKind.CommonShared,
                        subjects: [getRealtySubject()],
                    },
                ],
                expected: true,
            },
            {
                description: 'no commonKind, one owner',
                owners: [
                    {
                        subjects: [getRealtySubject()],
                    },
                ],
                expected: true,
            },
            {
                description: 'no commonKind, several owners',
                owners: [
                    {
                        subjects: [getRealtySubject()],
                    },
                    {
                        subjects: [getRealtySubject({ sbjCode: '1111110000' })],
                    },
                ],
                expected: false,
            },
        ]

        it.each(testParams)('should return $expected when $description', ({ owners, expected }) => {
            expect(drrpProvider.isSoleOwner(owners)).toBe(expected)
        })
    })

    describe('isInvalidOwnersData', () => {
        const testParams: IsInvalidOwnersDataTestParams[] = [
            // 1
            {
                description: 'one property, one subject, has partSize not equal 1, no prCommonKind',
                properties: [getRealtyProperty({ partSize: '1/2', subjects: [getRealtySubject()] })],
                expected: true,
            },
            {
                description: 'one property, one subject, has partSize not equal 1, common partial prCommonKind',
                properties: [
                    getRealtyProperty({
                        partSize: '1/2',
                        prCommonKind: PropertyCommonKind.CommonPartial,
                        subjects: [getRealtySubject()],
                    }),
                ],
                expected: true,
            },
            {
                description: 'one property, one subject, has partSize not equal 1, common shared prCommonKind',
                properties: [
                    getRealtyProperty({
                        partSize: '1/2',
                        prCommonKind: PropertyCommonKind.CommonShared,
                        subjects: [getRealtySubject()],
                    }),
                ],
                expected: false,
            },
            // 2
            {
                description: 'several properties, has partSizes not equal 1, all common partial prCommonKind',
                properties: [
                    getRealtyProperty({ partSize: '1/3', prCommonKind: PropertyCommonKind.CommonPartial }),
                    getRealtyProperty({ partSize: '1/3', prCommonKind: PropertyCommonKind.CommonPartial }),
                ],
                expected: true,
            },
            {
                description: 'several properties, has missing partSize fields for common partial prCommonKind',
                properties: [
                    getRealtyProperty({ prCommonKind: PropertyCommonKind.CommonShared }),
                    getRealtyProperty({ partSize: undefined, prCommonKind: PropertyCommonKind.CommonPartial }),
                ],
                expected: true,
            },
            {
                description: 'several properties, has partSizes not equal 1, but not all common partial prCommonKind',
                properties: [
                    getRealtyProperty({ partSize: '1/3', prCommonKind: PropertyCommonKind.CommonShared }),
                    getRealtyProperty({ partSize: '1/3', prCommonKind: PropertyCommonKind.CommonPartial }),
                ],
                expected: false,
            },
            // 3
            {
                description: 'has non-individual subjects',
                properties: [getRealtyProperty({ subjects: [getRealtySubject({ dcSbjType: DcSbjType.Entity })] })],
                expected: true,
            },
            {
                description: 'has individual subjects without sbjCode',
                properties: [getRealtyProperty({ subjects: [getRealtySubject({ dcSbjType: DcSbjType.Individual, sbjCode: undefined })] })],
                expected: true,
            },
            {
                description: 'has valid data',
                properties: [getRealtyProperty({})],
                expected: false,
            },
        ]

        it.each(testParams)('should return $expected when $description', ({ properties, expected }) => {
            const realty = getRealty({ properties })

            expect(drrpProvider.isInvalidOwnersData(realty)).toBe(expected)
        })
    })

    describe('extractIndividualOwners', () => {
        it('should return all individual subjects as owners', () => {
            const subject1 = getRealtySubject({ sbjName: 'Subject 1', sbjCode: '1', dcSbjType: DcSbjType.Individual })
            const subject2 = getRealtySubject({ sbjName: 'Subject 2', sbjCode: '2', dcSbjType: DcSbjType.Individual })
            const subject3 = getRealtySubject({ sbjName: 'Subject 3', sbjCode: '3', dcSbjType: DcSbjType.Individual })
            const nonIndividualSubject = getRealtySubject({ sbjName: 'Non-individual subject', dcSbjType: DcSbjType.Entity })
            const subjectWithoutSbjCode = getRealtySubject({
                sbjName: 'Subject without sbjCode',
                dcSbjType: DcSbjType.Individual,
                sbjCode: undefined,
            })

            const realty = getRealty({
                properties: [
                    getRealtyProperty({
                        rnNum: 1,
                        partSize: '1/2',
                        prCommonKind: PropertyCommonKind.CommonPartial,
                        subjects: [subject1, subject2, nonIndividualSubject, subjectWithoutSbjCode],
                    }),
                    getRealtyProperty({
                        rnNum: 2,
                        partSize: '1/2',
                        prCommonKind: PropertyCommonKind.CommonPartial,
                        subjects: [subject3],
                    }),
                ],
            })

            expect(drrpProvider.extractIndividualOwners(realty)).toEqual<PropertyOwnerInfo[]>([
                {
                    fullName: subject1.sbjName,
                    rnokpp: subject1.sbjCode!,
                    rnNum: 1,
                    partSize: '1/2',
                    prCommonKind: PropertyCommonKind.CommonPartial,
                },
                {
                    fullName: subject2.sbjName,
                    rnokpp: subject2.sbjCode!,
                    rnNum: 1,
                    partSize: '1/2',
                    prCommonKind: PropertyCommonKind.CommonPartial,
                },
                {
                    fullName: subject3.sbjName,
                    rnokpp: subject3.sbjCode!,
                    rnNum: 2,
                    partSize: '1/2',
                    prCommonKind: PropertyCommonKind.CommonPartial,
                },
            ])
        })
    })

    describe('getSubjectInfo', () => {
        const itn = 'itn'

        it('should call third party service', async () => {
            const resultData = {
                reportResultID: 1,
                groupResult: [],
            }
            const mockResponse = {
                resultData: JSON.stringify(resultData),
            }
            const spy = jest.spyOn(external, 'receiveDirect').mockResolvedValueOnce(mockResponse)

            const result = await drrpProvider.getSubjectInfo(itn)

            expect(spy).toHaveBeenCalledWith(
                ExternalEvent.PublicServiceDrrpExtSearch,
                {
                    entity: 'rrpExch_external',
                    method: 'search',
                    searchParams: {
                        isShowHistoricalNames: false,
                        isSuspend: false,
                        searchType: DrrpSearchType.Subject,
                        subjectSearchInfo: {
                            sbjType: '1',
                            sbjCode: itn,
                        },
                    },
                },
                {
                    validationRules: drrpExtSearchResultValidationSchema,
                    timeout: undefined,
                },
            )

            expect(result).toStrictEqual(resultData)
        })

        it('should throw service unavailable', async () => {
            jest.spyOn(external, 'receiveDirect').mockRejectedValueOnce(new Error('Error'))

            await expect(drrpProvider.getSubjectInfo(itn)).rejects.toThrow(ServiceUnavailableError)
        })

        it('should throw service unavailable due to error response', async () => {
            jest.spyOn(external, 'receiveDirect').mockResolvedValueOnce({
                resultData: JSON.stringify({
                    error: new Error('Error'),
                }),
            })

            await expect(drrpProvider.getSubjectInfo(itn)).rejects.toThrow(ServiceUnavailableError)
        })
    })

    describe('getSubjectInfoClarifying', () => {
        const reportResultId = 1
        const groupId = 1

        it('should call third party service', async () => {
            const resultData = {
                realty: [],
                oldRealty: [],
            }
            const mockResponse = {
                resultData: JSON.stringify(resultData),
            }
            const spy = jest.spyOn(external, 'receiveDirect').mockResolvedValueOnce(mockResponse)

            const result = await drrpProvider.getSubjectInfoClarifying(reportResultId, groupId)

            expect(spy).toHaveBeenCalledWith(
                ExternalEvent.PublicServiceDrrpExtGroup,
                {
                    entity: 'rrpExch_external',
                    method: 'generate',
                    reportResultID: reportResultId,
                    groupID: groupId,
                },
                {
                    validationRules: drrpExtGroupResultValidationSchema,
                },
            )

            expect(result).toStrictEqual(resultData)
        })
        it('should catch error from third party service', async () => {
            const mockResponse = {
                resultData: JSON.stringify({
                    error: 'something went wrong',
                }),
            }

            jest.spyOn(external, 'receiveDirect').mockResolvedValueOnce(mockResponse)

            await expect(drrpProvider.getSubjectInfoClarifying(reportResultId, groupId)).rejects.toThrow(ServiceUnavailableError)
        })

        it('should throw service unavailable for incorrect data', async () => {
            jest.spyOn(external, 'receiveDirect').mockResolvedValueOnce({
                resultData: {},
            })

            await expect(drrpProvider.getSubjectInfoClarifying(reportResultId, groupId)).rejects.toThrow(ServiceUnavailableError)
        })

        it('should throw service unavailable for empty data', async () => {
            jest.spyOn(external, 'receiveDirect').mockResolvedValueOnce({})

            await expect(drrpProvider.getSubjectInfoClarifying(reportResultId, groupId)).rejects.toThrow(ServiceUnavailableError)
        })
    })

    describe('getOwnershipType', () => {
        const itn = 'user1'
        const testParams: GetOwnershipTypeTestParams[] = [
            // Single ownership scenarios
            {
                description: 'single ownership with partSize === 1',
                properties: [
                    getRealtyProperty({
                        prCommonKind: PropertyCommonKind.CommonPartial,
                        partSize: '1',
                        subjects: [getRealtySubject({ sbjCode: itn })],
                    }),
                ],
                expected: OwnershipType.Single,
            },
            {
                description: 'single ownership with no partSize',
                properties: [
                    getRealtyProperty({
                        prCommonKind: PropertyCommonKind.CommonPartial,
                        subjects: [getRealtySubject({ sbjCode: itn })],
                    }),
                ],
                expected: OwnershipType.Single,
            },
            {
                description: 'single ownership with multiple properties and partSizesSum === 1',
                properties: [
                    getRealtyProperty({
                        prCommonKind: PropertyCommonKind.CommonPartial,
                        partSize: '1/2',
                        subjects: [getRealtySubject({ sbjCode: itn })],
                    }),
                    getRealtyProperty({
                        prCommonKind: PropertyCommonKind.CommonPartial,
                        partSize: '1/2',
                        subjects: [getRealtySubject({ sbjCode: itn })],
                    }),
                ],
                expected: OwnershipType.Single,
            },

            // Common shared ownership scenarios
            {
                description: 'common shared ownership with single property and any partSize',
                properties: [
                    getRealtyProperty({
                        prCommonKind: PropertyCommonKind.CommonShared,
                        partSize: '1/3',
                        subjects: [getRealtySubject({ sbjCode: itn }), getRealtySubject({ sbjCode: 'user2' })],
                    }),
                ],
                expected: OwnershipType.CommonShared,
            },
            {
                description: 'common shared ownership with single property and no partSize',
                properties: [
                    getRealtyProperty({
                        prCommonKind: PropertyCommonKind.CommonShared,
                        subjects: [getRealtySubject({ sbjCode: itn }), getRealtySubject({ sbjCode: 'user2' })],
                    }),
                ],
                expected: OwnershipType.CommonShared,
            },
            {
                description: 'common shared ownership with multiple common shared properties, and any partSize',
                properties: [
                    getRealtyProperty({
                        prCommonKind: PropertyCommonKind.CommonShared,
                        partSize: '1',
                        subjects: [getRealtySubject({ sbjCode: itn }), getRealtySubject({ sbjCode: 'user2' })],
                    }),
                    getRealtyProperty({
                        prCommonKind: PropertyCommonKind.CommonShared,
                        partSize: '1/3',
                        subjects: [getRealtySubject({ sbjCode: 'user2' }), getRealtySubject({ sbjCode: 'user3' })],
                    }),
                    getRealtyProperty({
                        prCommonKind: PropertyCommonKind.CommonShared,
                        subjects: [getRealtySubject({ sbjCode: itn }), getRealtySubject({ sbjCode: itn })],
                    }),
                ],
                expected: OwnershipType.CommonShared,
            },
            {
                description:
                    'common shared ownership with multiple mixed common shared and common partial properties, common partial partSizes < 1',
                properties: [
                    getRealtyProperty({
                        prCommonKind: PropertyCommonKind.CommonShared,
                        partSize: '1/2',
                        subjects: [getRealtySubject({ sbjCode: itn }), getRealtySubject({ sbjCode: 'user2' })],
                    }),
                    getRealtyProperty({
                        prCommonKind: PropertyCommonKind.CommonPartial,
                        partSize: '1/2',
                        subjects: [getRealtySubject({ sbjCode: 'user3' })],
                    }),
                ],
                expected: OwnershipType.CommonShared,
            },

            // Common partial ownership scenarios
            {
                description: 'common partial ownership with multiple properties',
                properties: [
                    getRealtyProperty({
                        prCommonKind: PropertyCommonKind.CommonPartial,
                        partSize: '1/2',
                        subjects: [getRealtySubject({ sbjCode: itn })],
                    }),
                    getRealtyProperty({
                        prCommonKind: PropertyCommonKind.CommonPartial,
                        partSize: '1/2',
                        subjects: [getRealtySubject({ sbjCode: 'user2' })],
                    }),
                ],
                expected: OwnershipType.CommonPartial,
            },
        ]

        it.each(testParams)('should return $expected when $description', ({ properties, expected }) => {
            const realty = getRealty({ properties })

            expect(drrpProvider.getOwnershipType(realty, itn)).toBe(expected)
        })

        it('should throw error for unknown ownership type', () => {
            const realty = getRealty({ properties: [] })

            expect(() => drrpProvider.getOwnershipType(realty, 'unknownUser')).toThrow(InternalServerError)
        })
    })
})
