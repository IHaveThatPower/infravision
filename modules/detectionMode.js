/**
 * Infravision Detection Mode, which determines whether or not a given
 * token should be "seen" by the Infravision Detection Mode (*NOT*
 * vision mode!) and get the token shader applied thereby.
 *
 * @author  IHaveThatPower <mcc@mcc3d.coom>
 */
import { InfraVisionFilter } from './detectionFilter.js';

export class DetectionModeInfravision extends DetectionMode {

    /**
     * If we haven't yet defined a detection filter, return a new one
     *
     * @override
     * @return {InfraVisionFilter}
     */
    static getDetectionFilter() {
        return (this._detectionFilter ??= InfraVisionFilter.create());
    }

    /**
     * Test whether or not a given target object is visible to a
     * supplied visionSource in a given mode, using a supplied set of
     * tests.
     *
     * @override
     * @see client/pixi/perception/detection-mode.js
     * @param {VisionSource} visionSource           The vision source being tested
     * @param {TokenDetectionMode} mode             The detection mode configuration
     * @param {CanvasVisibilityTestConfig} config   The visibility test configuration
     * @return {boolean}                            Is the test target visible?
     */
    testVisibility(visionSource, mode, {object, tests}={}) {
        if (!mode.enabled) return false;
        if (!this._canDetect(visionSource, object)) return false;

        // We want to track the number of visibility tests we pass, but
        // also the number of those tests that were illuminated. As
        // long as more tests passed than were illuminated, we qualify.
        let testsPassed = 0;
        let testsIlluminated = 0;
        for (const test of tests) {
            if (this._testPoint(visionSource, mode, object, test))
            {
                testsPassed += 1;
                if (this._testPointLit(visionSource, test))
                    testsIlluminated += 1;
            }
        }
        return (testsPassed - testsIlluminated) > 0;
    }

    /**
     * Test whether a point is in a light
     *
     * @param {VisionSource} visionSource  The vision source being tested
     * @param {object} test                The point being tested
     * @return {boolean}                   Is the test target lit?
     */
    _testPointLit(visionSource, test) {
        for (const lightSource of canvas.effects.lightSources.values()) {
            if (!lightSource.active) continue;
            if (lightSource.shape.contains(test.point.x, test.point.y)) {
                return true;
            }
        }
        return false;
    }

    // TODO: Add support for cold-blooded creatures?
    // The below code comes from SWADE
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