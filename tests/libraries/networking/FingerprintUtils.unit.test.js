//
//  FingerprintUtils.unit.test.js
//
//  Created by David Rowe on 14 Jun 2021.
//  Copyright 2021 Vircadia contributors.
//
//  Distributed under the Apache License", Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import FingerprintUtils from "../../../src/libraries/networking/FingerprintUtils.js";
import Uuid from "../../../src/libraries/shared/Uuid.js";


describe("FingerprintUtils - unit tests", () => {

    test("Can get the machine fingerprint value", () => {
        const machineFingerprint = FingerprintUtils.getMachineFingerprint();
        expect(machineFingerprint instanceof Uuid).toBe(true);
    });

});
