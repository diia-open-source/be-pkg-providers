import { ValidationSchema } from '@diia-inhouse/validators'

import { PublicServiceDrrpExtGroupResponse } from '../../interfaces/providers/drrp/publicServiceDrrpExtGroup'
import { PublicServiceDrrpExtSearchResponse } from '../../interfaces/providers/drrp/publicServiceDrrpExtSearch'
import { PublicServiceDrrpActualAtuIdResponse } from '../../interfaces/providers/drrp/publicServiceDrrpGetActualAtu'

export const drrpExtGroupResultValidationSchema: ValidationSchema<PublicServiceDrrpExtGroupResponse> = {
    resultData: { type: 'string' },
    resultMessage: { type: 'string', optional: true },
    entity: { type: 'string' },
    method: { type: 'string' },
    reportResultID: { type: 'number' },
    groupID: { type: 'number' },
    resultID: { type: 'number' },
    ID: { type: 'number' },
}

export const drrpExtSearchResultValidationSchema: ValidationSchema<PublicServiceDrrpExtSearchResponse> = {
    resultData: { type: 'string' },
    resultMessage: { type: 'string', optional: true },
    entity: { type: 'string' },
    method: { type: 'string' },
    resultID: { type: 'number' },
    ID: { type: 'number' },
}

export const drrpActualAtuValidationSchema: ValidationSchema<PublicServiceDrrpActualAtuIdResponse> = {
    atuID: { type: 'number', optional: true },
    actualAtuID: { type: 'array', optional: true, items: 'number' },
}
