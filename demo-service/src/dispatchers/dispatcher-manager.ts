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

import {Dispatcher, Dispatchers} from "./base-dispatcher";
import CloudeventsDispatcher from "./cloudevents";
import DebugDispatcher from "./debug";

import {CsnfEvent} from "onug-csnf";

const logger = log4js.getLogger('dispatcher-manager');
logger.level = process.env.LOG_LEVEL || 'debug';


export default class DispatcherManager {

    private dispatchers: Dispatcher[] = [];

    constructor() {
        logger.trace('> constructor');
        this.dispatchers.push(new CloudeventsDispatcher());
        logger.trace('< constructor');
    }

    dispatch(originalEvent: any, csnfEvent: CsnfEvent, csnfDecoration: any, dispatchers: string[] = [Dispatchers.DEBUG]) {
        logger.trace('> dispatch');

        this.dispatchers.map((dispatcher) => {
            if (dispatchers.includes(Dispatchers.ALL) || dispatchers.includes(dispatcher.name)){
                dispatcher.dispatch(originalEvent, csnfEvent, csnfDecoration);
            }
        });

        logger.trace('< dispatch');
    }
}
