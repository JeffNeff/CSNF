/**
 * (C) Copyright IBM Corp. 2021.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 import * as log4js from 'log4js';
 import {CsnfEvent} from 'onug-csnf';
 import axios from "axios";
 import * as https from "https";
 import {BaseDispatcher, Dispatchers} from "./base-dispatcher";
 import { HTTP, CloudEvent } from "cloudevents";

 const logger = log4js.getLogger('cloudevents-dispatcher');
 logger.level = process.env.LOG_LEVEL || 'debug';

 export default class CloudeventsDispatcher extends BaseDispatcher {
    private ksink: string

    constructor() {
        super(Dispatchers.CLOUDEVENTS);

        logger.trace('> constructor');
        this.ksink = process.env.K_SINK;
        logger.trace('< constructor');
    }

    async dispatch(originalEvent: any, csnfEvent: CsnfEvent, csnfDecoration: any) {
        logger.trace('> dispatch');

        const payload = {
            event: {
                event: csnfEvent,
                decoration: csnfDecoration
            },
            sourcetype: csnfEvent.reporter.name
        };

        const ce = new CloudEvent({ type:"io.triggermesh.csnf.event", source:"csnf", data: payload });
        const message = HTTP.binary(ce); // Or HTTP.structured(ce)

        try {
            const result = await axios.post(this.ksink,  message.body, {
                headers: message.headers,
                });

            if (result.status === 202 || result.status === 201 || result.status === 200) {
                logger.debug('event successfully dispatched');
            } else {
                logger.error('failed to dispatch event', result);
            }
        } catch (e) {
            logger.error('failed to dispatch event', e);
        }

        logger.trace('< dispatch');
    }
}
