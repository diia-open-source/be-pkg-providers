import { flatMap, max, uniq } from 'lodash'
import Mexp from 'math-expression-evaluator'
import { SetRequired } from 'type-fest'

import { ExternalCommunicator, ExternalEvent } from '@diia-inhouse/diia-queue'
import { ReceiveDirectOps } from '@diia-inhouse/diia-queue/dist/types/interfaces/externalCommunicator'
import { InternalServerError, ServiceUnavailableError } from '@diia-inhouse/errors'
import { Logger } from '@diia-inhouse/types'

import { DrrpConfig, DrrpRequestOptions, OwnershipType, PropertyCommonKind, PropertyOwnerInfo } from '../../interfaces/providers/drrp'
import {
    PublicServiceDrrpExtGroupRequest,
    PublicServiceDrrpExtGroupResponse,
    PublicServiceDrrpExtGroupResult,
    SubjectInfoClarifyingResult,
} from '../../interfaces/providers/drrp/publicServiceDrrpExtGroup'
import {
    DcSbjType,
    DrrpSearchType,
    PublicServiceDrrpExtSearchRequest,
    PublicServiceDrrpExtSearchResponse,
    PublicServiceDrrpObjectRequest,
    PublicServiceDrrpObjectResponse,
    PublicServiceDrrpSubjectRequest,
    PublicServiceDrrpSubjectResponse,
    Realty,
    RealtyProperty,
    RealtySubject,
    SubjectInfoResult,
} from '../../interfaces/providers/drrp/publicServiceDrrpExtSearch'
import {
    PublicServiceDrrpActualAtuIdRequest,
    PublicServiceDrrpActualAtuIdResponse,
} from '../../interfaces/providers/drrp/publicServiceDrrpGetActualAtu'
import {
    drrpActualAtuValidationSchema,
    drrpExtGroupResultValidationSchema,
    drrpExtSearchResultValidationSchema,
} from '../../validation/drrp'

export class DrrpProvider {
    constructor(
        private readonly logger: Logger,
        private readonly external: ExternalCommunicator,

        private readonly drrpConfig: DrrpConfig = {},
    ) {}

    async getSubjectInfo(itn: string, ops?: DrrpRequestOptions): Promise<SubjectInfoResult> {
        const request: PublicServiceDrrpSubjectRequest = {
            isShowHistoricalNames: false,
            searchType: DrrpSearchType.Subject,
            subjectSearchInfo: {
                sbjType: '1',
                sbjCode: itn,
            },
        }
        const response = await this.makeExtSearchRequest<PublicServiceDrrpSubjectResponse>(request, ops)

        if ('error' in response) {
            const { error } = response

            const errorMsg = 'Failed to retrieve subject data from the drrp registry'

            this.logger.error(errorMsg, error)

            throw new ServiceUnavailableError(errorMsg)
        }

        const { reportResultID, groupResult } = response

        return { reportResultID, groupResult }
    }

    async getSubjectInfoClarifying(
        reportResultId: number,
        groupId: number,
        ops: DrrpRequestOptions = {},
    ): Promise<SubjectInfoClarifyingResult> {
        const request: PublicServiceDrrpExtGroupRequest = {
            entity: 'rrpExch_external',
            method: 'generate',
            reportResultID: reportResultId,
            groupID: groupId,
        }
        const response = await this.request<PublicServiceDrrpExtGroupResponse>(ExternalEvent.PublicServiceDrrpExtGroup, request, {
            validationRules: drrpExtGroupResultValidationSchema,
            ...ops,
        })

        let result: PublicServiceDrrpExtGroupResult
        try {
            if (!response) {
                throw new Error('Failed to fetch DrrpExtGroup')
            }

            result = JSON.parse(response.resultData)
        } catch (err) {
            const errorMsg = 'Failed to parse clarifying subject result data from the drrp registry'

            this.logger.error(errorMsg, { err, response })

            throw new ServiceUnavailableError(errorMsg)
        }

        const { error, realty, oldRealty }: PublicServiceDrrpExtGroupResult = result
        if (error) {
            const errorMsg = 'Failed to retrieve clarifying subject data from the drrp registry'

            this.logger.error(errorMsg, error)

            throw new ServiceUnavailableError(errorMsg)
        }

        return { realty, oldRealty }
    }

    async getObjectInfo(realtyId: string, ops?: DrrpRequestOptions): Promise<Realty | undefined> {
        const request: PublicServiceDrrpObjectRequest = {
            isShowHistoricalNames: false,
            searchType: DrrpSearchType.Object,
            objectSearchInfo: {
                realtyRnNum: realtyId,
            },
        }
        const response = await this.makeExtSearchRequest<PublicServiceDrrpObjectResponse>(request, ops)
        const [realty] = response.realty

        if (!realty) {
            return
        }

        return realty
    }

    async getActualAtuId(atuId: number, ops: DrrpRequestOptions = {}): Promise<number> {
        const request: PublicServiceDrrpActualAtuIdRequest = {
            atuID: atuId,
        }
        const response = await this.request<PublicServiceDrrpActualAtuIdResponse>(ExternalEvent.PublicServiceDrrpGetActualAtu, request, {
            validationRules: drrpActualAtuValidationSchema,
            ...ops,
        })

        if (!response) {
            return atuId
        }

        const { actualAtuID } = response

        if (!actualAtuID) {
            return atuId
        }

        const result = max(actualAtuID)

        return result ?? atuId
    }

    async getActualAtuIds(atuId: number, ops: DrrpRequestOptions = {}): Promise<number[]> {
        const request: PublicServiceDrrpActualAtuIdRequest = {
            atuID: atuId,
        }
        const response = await this.request<PublicServiceDrrpActualAtuIdResponse>(ExternalEvent.PublicServiceDrrpGetActualAtu, request, {
            validationRules: drrpActualAtuValidationSchema,
            ...ops,
        })

        if (!response) {
            return [atuId]
        }

        const { actualAtuID } = response

        if (!actualAtuID?.length) {
            return [atuId]
        }

        return actualAtuID
    }

    /** @deprecated use getOwnershipType */
    isSoleOwner(owners: Pick<RealtyProperty, 'prCommonKind' | 'subjects' | 'partSize'>[]): boolean {
        if (!owners.length) {
            return false
        }

        const ownersRnokpp = owners.map((owner) => owner.subjects.at(0)?.sbjCode).filter(Boolean)
        const uniqOwners = uniq(ownersRnokpp)

        if (uniqOwners.length !== 1) {
            return false
        }

        const [{ prCommonKind }] = owners

        if (!prCommonKind || prCommonKind === PropertyCommonKind.CommonShared) {
            return true
        }

        if (prCommonKind === PropertyCommonKind.CommonPartial) {
            return this.countPartSizeSum(owners) >= 1
        }

        return false
    }

    /** @deprecated use isInvalidOwnersData */
    checkOwnersShares(owners: Pick<RealtyProperty, 'partSize' | 'prCommonKind'>[]): boolean {
        if (!owners.length) {
            return false
        }

        const [{ prCommonKind }] = owners

        if (!prCommonKind || prCommonKind === PropertyCommonKind.CommonShared) {
            return true
        }

        if (prCommonKind === PropertyCommonKind.CommonPartial) {
            const partSizesSum = this.countPartSizeSum(owners)

            this.logger.info(`Owners part sizes sum: ${partSizesSum}`)

            return partSizesSum >= 1
        }

        throw new InternalServerError(`Unexpected property common kind: ${prCommonKind}`)
    }

    /**
     * @see {@link https://diia.atlassian.net/wiki/spaces/DIIA/pages/1283620916/BRD.036001002.+.v.01.001#5.2.1-%D0%86%D0%BD%D1%84%D0%BE%D1%80%D0%BC%D1%83%D0%B2%D0%B0%D0%BD%D0%BD%D1%8F-%D0%BA%D0%BE%D1%80%D0%B8%D1%81%D1%82%D1%83%D0%B2%D0%B0%D1%87%D0%B0-%D0%BF%D1%80%D0%BE-%D0%BD%D0%B5%D0%BC%D0%BE%D0%B6%D0%BB%D0%B8%D0%B2%D1%96%D1%81%D1%82%D1%8C-%D0%BF%D0%BE%D0%B4%D0%B0%D1%87%D1%96-%D0%B7%D0%B0%D1%8F%D0%B2%D0%B8%2C-%D1%87%D0%B5%D1%80%D0%B5%D0%B7-%D0%B2%D1%96%D0%B4%D1%81%D1%83%D1%82%D0%BD%D1%96%D1%81%D1%82%D1%8C-%D0%B2-%D0%94%D0%A0%D0%A0%D0%9F-%D0%B2%D1%96%D0%B4%D0%BE%D0%BC%D0%BE%D1%81%D1%82%D0%B5%D0%B9%2C-%D1%89%D0%BE%D0%B4%D0%BE-%D0%B2%D1%81%D1%96%D1%85-%D1%81%D0%BF%D1%96%D0%B2%D0%B2%D0%BB%D0%B0%D1%81%D0%BD%D0%B8%D0%BA%D1%96%D0%B2 documentation page}
     */
    isInvalidOwnersData(realty: Realty): boolean {
        const { properties } = realty

        const partSizesSum = this.countPartSizeSum(properties)

        if (properties.length === 1) {
            const [{ partSize, subjects }] = properties

            // 1
            if (partSize && partSizesSum !== 1 && subjects.length === 1) {
                this.logger.info('Invalid drrp data: partSize not equal 1', { partSizesSum })

                return true
            }
        } else {
            // 2
            const hasPartSizes = properties.some(({ partSize }) => partSize)
            const hasMissingPartSizes = properties.some(({ partSize }) => !partSize)

            if (hasPartSizes && (partSizesSum !== 1 || hasMissingPartSizes)) {
                this.logger.info('Invalid drrp data: partSizes not equal 1 or has properties with missing partSize', {
                    partSizesSum,
                    hasMissingPartSizes,
                })

                return true
            }
        }

        // 3
        const hasMissingSubjectsForCommonShared = properties.some(
            ({ prCommonKind, subjects }) => prCommonKind === PropertyCommonKind.CommonShared && subjects.length <= 1,
        )
        if (hasMissingSubjectsForCommonShared) {
            this.logger.info('Invalid drrp data: missing subjects for common shared property')

            return true
        }

        const hasNonIndividualSubjects = properties.some(({ subjects }) =>
            subjects.some(({ dcSbjType }) => dcSbjType !== DcSbjType.Individual),
        )
        if (hasNonIndividualSubjects) {
            this.logger.info('Invalid drrp data: properties contain non-individual subjects')

            return true
        }

        // children individual may not have sbjCode
        const hasIndividualSubjectsWithoutSbjCode = properties.some(({ subjects }) =>
            subjects.some(({ dcSbjType, sbjCode }) => dcSbjType === DcSbjType.Individual && !sbjCode),
        )
        if (hasIndividualSubjectsWithoutSbjCode) {
            this.logger.info('Invalid drrp data: properties contain individual subjects without sbjCode')

            return true
        }

        return false
    }

    extractIndividualOwners(realty: Realty): PropertyOwnerInfo[] {
        const owners: PropertyOwnerInfo[] = flatMap(realty.properties, (property) => {
            const { rnNum, partSize, prCommonKind, subjects } = property

            return subjects
                .filter(
                    (item): item is SetRequired<RealtySubject, 'sbjCode'> =>
                        item.dcSbjType === DcSbjType.Individual && Boolean(item.sbjCode),
                )
                .map(({ sbjName, sbjCode }) => ({
                    fullName: sbjName,
                    rnokpp: sbjCode,
                    rnNum,
                    partSize,
                    prCommonKind,
                }))
        })

        return owners
    }

    getOwnershipType(realty: Realty, itn: string, invalidDataProcessCode?: number): OwnershipType | never {
        const { properties } = realty

        if (this.isSingleOwnershipType(properties, itn)) {
            return OwnershipType.Single
        }

        if (this.isCommonPartialOwnershipType(properties, itn)) {
            return OwnershipType.CommonPartial
        }

        if (this.isCommonSharedOwnershipType(properties, itn)) {
            return OwnershipType.CommonShared
        }

        this.logger.error('Failed to determine ownership type', { properties })

        throw new InternalServerError('Failed to determine ownership type', invalidDataProcessCode)
    }

    /**
     * @see {@link https://diia.atlassian.net/wiki/spaces/DIIA/pages/1283620916/BRD.036001002.+.v.01.001#5.3.2-%D0%92%D0%B8%D0%B7%D0%BD%D0%B0%D1%87%D0%B5%D0%BD%D0%BD%D1%8F%2C-%D1%89%D0%BE-%D0%B7%D0%B0%D1%8F%D0%B2%D0%BD%D0%B8%D0%BA-%D1%94-%D0%BE%D0%B4%D0%BD%D0%BE%D0%BE%D1%81%D1%96%D0%B1%D0%BD%D0%B8%D0%BC-%D0%B2%D0%BB%D0%B0%D1%81%D0%BD%D0%B8%D0%BA%D0%BE%D0%BC-%D0%BE%D0%B1%D1%80%D0%B0%D0%BD%D0%BE%D0%B3%D0%BE-%D0%BE%D0%B1%CA%BC%D1%94%D0%BA%D1%82%D0%B0-%D0%BD%D0%B5%D1%80%D1%83%D1%85%D0%BE%D0%BC%D0%BE%D1%81%D1%82%D1%96 documentation page}
     */
    private isSingleOwnershipType(properties: RealtyProperty[], itn: string): boolean {
        const partSizesSum = this.countPartSizeSum(properties)

        if (properties.length === 1) {
            const [{ prCommonKind, partSize, subjects }] = properties

            const hasUserWithoutCoOwners = subjects.length === 1 && subjects[0].sbjCode === itn

            // 1
            if (partSizesSum === 1 && hasUserWithoutCoOwners && (!prCommonKind || prCommonKind === PropertyCommonKind.CommonPartial)) {
                return true
            }

            // 3
            if (!partSize && hasUserWithoutCoOwners && (!prCommonKind || prCommonKind === PropertyCommonKind.CommonPartial)) {
                return true
            }
        } else {
            const isSingleSubject = properties.every(({ prCommonKind, partSize, subjects }) => {
                const isUserSingleSubject = subjects.length === 1 && subjects[0].sbjCode === itn

                return partSize && isUserSingleSubject && prCommonKind === PropertyCommonKind.CommonPartial
            })

            // 2
            if (partSizesSum === 1 && isSingleSubject) {
                return true
            }
        }

        return false
    }

    /**
     * @see {@link https://diia.atlassian.net/wiki/spaces/DIIA/pages/1283620916/BRD.036001002.+.v.01.001#5.3.3-%D0%92%D1%96%D0%B4%D0%BE%D0%B1%D1%80%D0%B0%D0%B6%D0%B5%D0%BD%D0%BD%D1%8F-%D0%B5%D0%BA%D1%80%D0%B0%D0%BD%D0%B0-%E2%80%9C%D0%A1%D0%BF%D1%96%D0%B2%D0%B2%D0%BB%D0%B0%D1%81%D0%BD%D0%B8%D0%BA%D0%B8-%D0%BC%D0%B0%D0%B9%D0%BD%D0%B0%E2%80%9C--%D1%83-%D1%81%D1%82%D0%B0%D0%BD%D1%96-%D0%BF%D1%96%D0%B4%D1%82%D0%B2%D0%B5%D1%80%D0%B4%D0%B6%D0%B5%D0%BD%D0%BD%D1%8F-%D0%BF%D0%B5%D1%80%D0%B5%D0%BB%D1%96%D0%BA%D1%83-%D1%81%D0%BF%D1%96%D0%B2%D0%B2%D0%BB%D0%B0%D1%81%D0%BD%D0%B8%D0%BA%D1%96%D0%B2-%D0%BC%D0%B0%D0%B9%D0%BD%D0%B0 documentation page}
     */
    private isCommonSharedOwnershipType(properties: RealtyProperty[], itn: string): boolean {
        const partSizesSum = this.countPartSizeSum(properties)
        const uniqueItns = new Set(flatMap(properties.map(({ subjects }) => subjects.map(({ sbjCode }) => sbjCode))))
        const hasUserWithCoOwners = uniqueItns.size > 1 && uniqueItns.has(itn)

        if (properties.length === 1) {
            const [{ prCommonKind, partSize }] = properties

            // 1
            if (partSizesSum === 1 && hasUserWithCoOwners && prCommonKind === PropertyCommonKind.CommonShared) {
                return true
            }

            // 2
            if (!partSize && hasUserWithCoOwners && prCommonKind === PropertyCommonKind.CommonShared) {
                return true
            }
        } else {
            const isAllCommonShared = properties.every(({ prCommonKind, partSize, subjects }) => {
                const isNotSingleSubject = subjects.length > 1

                return partSize && isNotSingleSubject && prCommonKind === PropertyCommonKind.CommonShared
            })

            // 3, 5
            if (partSizesSum === 1 && isAllCommonShared && hasUserWithCoOwners) {
                return true
            }

            const isAllCommonSharedOrCommonPartial = properties.every(({ prCommonKind, partSize, subjects }) => {
                const isCommonShared = subjects.length > 1 && prCommonKind === PropertyCommonKind.CommonShared
                const isCommonPartial = subjects.length === 1 && prCommonKind === PropertyCommonKind.CommonPartial

                return partSize && (isCommonShared || isCommonPartial)
            })

            // 4
            if (partSizesSum === 1 && isAllCommonSharedOrCommonPartial && hasUserWithCoOwners) {
                return true
            }
        }

        return false
    }

    /**
     * @see {@link https://diia.atlassian.net/wiki/spaces/DIIA/pages/1283620916/BRD.036001002.+.v.01.001#5.3.4-%D0%92%D1%96%D0%B4%D0%BE%D0%B1%D1%80%D0%B0%D0%B6%D0%B5%D0%BD%D0%BD%D1%8F-%D0%B5%D0%BA%D1%80%D0%B0%D0%BD%D0%B0-%E2%80%9C%D0%A1%D0%BF%D1%96%D0%B2%D0%B2%D0%BB%D0%B0%D1%81%D0%BD%D0%B8%D0%BA%D0%B8-%D0%BC%D0%B0%D0%B9%D0%BD%D0%B0%E2%80%9C--%D1%83-%D1%81%D1%82%D0%B0%D0%BD%D1%96-%D0%B2%D0%B8%D0%B1%D0%BE%D1%80%D1%83-%D1%82%D0%B8%D0%BF%D0%B0-%D0%B7%D0%B0%D1%8F%D0%B2%D0%B8-(%D0%BE%D0%B4%D0%BD%D0%BE%D0%BE%D1%81%D1%96%D0%B1%D0%BD%D0%B0-%D0%B0%D0%B1%D0%BE-%D1%81%D0%BF%D1%96%D0%BB%D1%8C%D0%BD%D0%B0) documentation page}
     */
    private isCommonPartialOwnershipType(properties: RealtyProperty[], itn: string): boolean {
        const partSizesSum = this.countPartSizeSum(properties)
        const uniqueItns = new Set(flatMap(properties.map(({ subjects }) => subjects.map(({ sbjCode }) => sbjCode))))
        const hasUserWithCoOwners = uniqueItns.size > 1 && uniqueItns.has(itn)

        if (properties.length > 1) {
            const isAllCommonPartial = properties.every(({ prCommonKind, partSize, subjects }) => {
                const isSingleSubject = subjects.length === 1

                return partSize && isSingleSubject && prCommonKind === PropertyCommonKind.CommonPartial
            })

            // 1
            if (partSizesSum === 1 && isAllCommonPartial && hasUserWithCoOwners) {
                return true
            }
        }

        return false
    }

    private countPartSizeSum(owners: Pick<RealtyProperty, 'partSize'>[]): number {
        if (!owners.length) {
            return 0
        }

        const partSizes = owners.map(({ partSize }) => partSize).filter(Boolean)
        if (!partSizes.length) {
            return 0
        }

        const mexp = new Mexp()
        const partSizesSum = mexp.eval(partSizes.join('+'), [], {})

        return partSizesSum
    }

    private async makeExtSearchRequest<T>(
        searchParams: PublicServiceDrrpSubjectRequest | PublicServiceDrrpObjectRequest,
        ops: DrrpRequestOptions = {},
    ): Promise<T> {
        const request: PublicServiceDrrpExtSearchRequest = {
            entity: 'rrpExch_external',
            method: 'search',
            searchParams,
        }

        const response = await this.request<PublicServiceDrrpExtSearchResponse>(ExternalEvent.PublicServiceDrrpExtSearch, request, {
            validationRules: drrpExtSearchResultValidationSchema,
            timeout: this.drrpConfig.extSearchTimeout,
            ...ops,
        })

        try {
            if (!response) {
                throw new Error('Failed to makeRequest')
            }

            return JSON.parse(response.resultData)
        } catch (err) {
            const errorMsg = 'Failed to parse result data from the drrp registry'

            this.logger.error(errorMsg, { err, response })

            throw new ServiceUnavailableError(errorMsg)
        }
    }

    private async request<T>(
        event: ExternalEvent,
        request: unknown,
        ops?: ReceiveDirectOps & { unavailableProcessCode?: number },
    ): Promise<T> {
        try {
            return await this.external.receiveDirect<T>(event, request, { timeout: this.drrpConfig.timeout, ...ops })
        } catch (err) {
            this.logger.error('Failed to request drrp', { err })

            throw new ServiceUnavailableError(
                'Drrp service is unavailable',
                ops?.unavailableProcessCode || this.drrpConfig.unavailableProcessCode,
            )
        }
    }
}
