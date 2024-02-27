/**
 * Infravision module for FoundryVTT
 *
 * Provides a vision type (Infravision) and a detection mode (also
 * Infravision), intended to work in-tandem, to simulate the ability to
 * see living creatures as heat sources (in the style of the Predator)
 * while seeing the background environment as largely cool blues with
 * occasional bits of green.
 *
 * Module inspired by the work done for SWADE by Joe Meehan and FloRad.
 *
 * @author  IHaveThatPower <mcc@mcc3d.com>
 */

import { DetectionModeInfravision } from './modules/detectionMode.js';
import { InfraVisionFilter } from './modules/detectionFilter.js';
import { InfravisionColorationVisionShader } from './modules/backgroundShader.js';
import { Infravision } from './modules/infravision.js';

Hooks.once('init', () => {
    // Override CanvasVisibility class's testVisibility() function
    libWrapper.register('infravision', 'CanvasVisibility.prototype.testVisibility', function(wrapped, ...args) {
        const result = wrapped(...args); // Base result, which we'll drop on the floor if our own stuff is in effect
        return Infravision.testVisibility(result, args);
    }, 'WRAPPER');

    // Add our detection mode
    CONFIG.Canvas.detectionModes.infravision = new DetectionModeInfravision({
        id: 'infravision',
        label: 'Infravision', // TODO: Localize
        type: DetectionMode.DETECTION_TYPES.OTHER,
    });

    // Add our vision mode
    CONFIG.Canvas.visionModes.infraVision = new VisionMode({
        id: 'infraVision',
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
            background: { shader: InfravisionColorationVisionShader }
        }
    });
});