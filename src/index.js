/*
 * Copyright 2019 Igalia, S.L.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* JS */
import * as app from './js/app';
import { api } from 'agl-js-api';
import './leaflet/leaflet-src';
import * as map from './js/map';
import './leaflet-routing-machine-3.2.12/dist/leaflet-routing-machine';
import './leaflet-routing-machine-3.2.12/examples/Control.Geocoder';
import './js/leaflet.rotatedMarker';

/* CSS */
import './styles/app.scss';
import './leaflet/leaflet.css';
import './leaflet-routing-machine-3.2.12/dist/leaflet-routing-machine.css';



window.app = app;

api.init();

app.init('start');
