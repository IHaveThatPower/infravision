import { InfraVisionFilter } from './detectionFilter.js';

export class DetectionModeInfravision extends DetectionMode {
    static getDetectionFilter() {
        return (this._detectionFilter ??= InfraVisionFilter.create());
    }

    /** override **/
    testVisibility(visionSource, mode, {object, tests}={}) {
        if (!mode.enabled) {
            console.log('INFRAVISION | Mode not enabled');
            return false;
        }
        if (!this._canDetect(visionSource, object)) {
            console.log('INFRAVISION | canDetect fails');
            return false;
        }
        // We want a majority of points tested
        let testsPassed = 0;
        let testsIlluminated = 0;
        for (const test of tests) {
            console.log('INFRAVISION | testing testPoint', test.point.x, test.point.y);
            const testPassed = this._testPoint(visionSource, mode, object, test)
            if (testPassed)
                testsPassed += 1;
            if (testPassed && this._testPointLit(visionSource, mode, object, test))
                testsIlluminated += 1;
        }
        console.log('INFRAVISION | testsPassed', testsPassed, '(', testsIlluminated, ' illuminted)');
        return (testsPassed - testsIlluminated) > 0;
    }

    /**
     * Test whether a point is in a light
     * 
     */
    _testPointLit(visionSource, mode, target, test) {
        for (const lightSource of canvas.effects.lightSources.values()) {
            if (!lightSource.active) continue;
            if (lightSource.shape.contains(test.point.x, test.point.y)) {
                return true;
            }
        }
        return false;
    }
    /*
    _canDetect(visionSource, target) {
        // See/Sense Heat can ONLY detect warm tokens, ignoring those that are cold-bodied
        const tgt = target?.document;
        const coldBodied = tgt instanceof TokenDocument && tgt.hasStatusEffect(CONFIG.specialStatusEffects.COLDBODIED);
        console.log(target, 'is cold bodied?', coldBodied);
        if (coldBodied)
            return false;
        // The source may not be blind if the detection mode requires sight
        const src = visionSource.object.document;
        const isBlind = src instanceof TokenDocument && this.type === DetectionMode.DETECTION_TYPES.SIGHT && src.hasStatusEffect(CONFIG.specialStatusEffects.BLIND);
        console.log(src, 'is blind?', isBlind);
        return !isBlind;
    }
    */
}