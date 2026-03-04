import { PartialDeep } from 'type-fest'

import { QueueConfigType, QueueConnectionConfig } from '@diia-inhouse/diia-queue'

import { ExternalEvent, ExternalTopic } from '../../interfaces/providers'

export const drrpProviderQueueConfig: PartialDeep<QueueConnectionConfig['serviceRulesConfig']> = {
    servicesConfig: {
        [QueueConfigType.External]: {
            subscribe: [],
            publish: [
                ExternalEvent.PublicServiceDrrpExtSearch,
                ExternalEvent.PublicServiceDrrpExtGroup,
                ExternalEvent.PublicServiceDrrpGetActualAtu,
            ],
        },
    },
    topicsConfig: {
        [QueueConfigType.External]: {
            [ExternalTopic.Repo]: {
                events: [
                    ExternalEvent.PublicServiceDrrpExtSearch,
                    ExternalEvent.PublicServiceDrrpExtGroup,
                    ExternalEvent.PublicServiceDrrpGetActualAtu,
                ],
            },
        },
    },
}
