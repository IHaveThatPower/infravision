/**
 * Infravision static class that provides similar behavior to the
 * CanvasVisibility.testVisibility method, but without the default to
 * basic sight.
 *
 * @author  IHaveThatPower <mcc@mcc3d.com>
 */

import {
    InfravisionColorationVisionShaderBlack,
    InfravisionColorationVisionShaderWhite
} from './backgroundShader.js';

export class Infravision
{
    static MODULE_NAME = 'infravision';
    static GRID_SCALE_DEFAULT = 50;

    /**
     * Implement some alternate rules for testVisibility.
     *
     * @param {boolean} result  Result from CanvasVisibility.testVisibility()
     * @param {objects} args    Arguments originally passed to CanvasVisibility.testVisibility()
     * @return {boolean}
     */
    static testVisibility(result, args)
    {
        // If no vision sources are present, default to standard
        if (!canvas.effects.visionSources.some(s => s.active)) return result;

        // Set up our various parameters
        // Much of what follows is lifted from CanvasVisibility.testVisability
        let point, options, object;
        [point, options] = args;

        // We need an object
        if (options.object)
            object = options.object;
        if (!(object instanceof Token)) return result; // Special detection modes only detect tokens

        const modes = CONFIG.Canvas.detectionModes;
        const config = Infravision.generateConfig(object, point, options.tolerance);

        // Check 'em!
        for (const visionSource of canvas.effects.visionSources.values()) {
            if (!visionSource.active) continue;

            // Get the viewing object's document (the token)
            const viewingToken = visionSource.object.document;

            // If the token doesn't have Infravision, move along
            let infraMode = viewingToken.detectionModes.find(m => m.id === 'infravision');
            if (!infraMode) continue;

            // Determine whether or not the current thing is visible to Infravision
            const dmInfra = modes[infraMode.id];
            const infraResult = dmInfra.testVisibility(visionSource, infraMode, config);

            // If Infra can see it, apply the filter
            if (infraResult === true) {
                object.detectionFilter = dmInfra.constructor.getDetectionFilter();
                return true;
            }
        }
        return result;
    }

    /**
     * Given a point, return whether or not the point is within the
     * scene.
     *
     * @param point
     * @return {boolean}
     */
    static inScene(point) {
        return canvas.dimensions.sceneRect.contains(point.x, point.y);
    }

    /**
     * Generate the config object used by the testVisibility method
     * of the detection mode.
     *
     * @param object
     * @param point
     * @param {integer} tolerance
     * @return {object}
     */
    static generateConfig(object, point, tolerance) {
        // We need to define a bounding region for the token
        // TODO: This currently assumes token of grid size = 1
        let t = (game?.canvas?.grid?.w || Infravision.GRID_SCALE_DEFAULT) / 2;
        if (!!tolerance)
            t = tolerance;

        // Define our test area
        const offsets = t > 0 ? [[0, 0], [-t, -t], [-t, t], [t, t], [t, -t], [-t, 0], [t, 0], [0, -t], [0, t]] : [[0, 0]];
        return {
          object,
          tests: offsets.map(o => ({
            point: new PIXI.Point(point.x + o[0], point.y + o[1]),
            los: new Map()
          }))
        };
    }

    /**
     * Setup the vision mode, toggling the shader to be used
     *
     * @return void
     */
    static setupVisionMode() {
        // TODO: This should really be per-map-aware. See note in base module.
        const visionModeSetting = game.settings.get(Infravision.MODULE_NAME, 'background-mode');
        const useShader = (visionModeSetting === 1) ? InfravisionColorationVisionShaderWhite : InfravisionColorationVisionShaderBlack;
        CONFIG.Canvas.visionModes.infraVision = new VisionMode({
            id: Infravision.MODULE_NAME,
            label: 'Infravision', // TODO: Localize
            lighting: {
                background: { visibility: VisionMode.LIGHTING_VISIBILITY.REQUIRED }
            },
            vision: {
                darkness: { adaptive: false },
                defaults: {
                    attenuation: 0,
                    brightness: 0,
                    saturation: 0,
                    contrast: 0,
                },
                background: { shader: useShader }
            }
        });
    }
}
