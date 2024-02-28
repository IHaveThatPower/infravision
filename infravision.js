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
import { Infravision } from './modules/infravision.js';

Hooks.once('init', () => {
    // Override CanvasVisibility class's testVisibility() function
    libWrapper.register(Infravision.MODULE_NAME, 'CanvasVisibility.prototype.testVisibility', function(wrapped, ...args) {
        const result = wrapped(...args); // Base result, which we'll drop on the floor if our own stuff is in effect
        return Infravision.testVisibility(result, args);
    }, 'WRAPPER');

    // Add our detection mode
    CONFIG.Canvas.detectionModes.infravision = new DetectionModeInfravision({
        id: Infravision.MODULE_NAME,
        label: 'Infravision', // TODO: Localize
        type: DetectionMode.DETECTION_TYPES.OTHER,
    });

    // Register the black/white setting toggle
    game.settings.register(Infravision.MODULE_NAME, 'background-mode', {
        name: "Background Mode", // TODO: Localize
        hint: "Which color (on background images, tiles, etc.) should be treated as \"coldest\" when using infravision? (Does not affect Tokens.)", // TODO: Localize
        scope: "world", // TODO: This should really be a client setting that gets flipped around based on which map a user is viewing, and what that map's setting is
        config: true,
        type: Number,
        default: 0,
        choices: {
            0: "Black",
            1: "White"
        },
        restricted: true
    });

    // Add our vision mode
    Infravision.setupVisionMode();
});

Hooks.on('closeSettingsConfig', () => {
    Infravision.setupVisionMode();
    foundry.utils.debouncedReload();
});