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
        label: 'Infravision',
        /*
        canvas: {
            shader: ColorAdjustmentsSamplerShader,
            uniforms: {
                saturation: 0,
                tint: InfravisionBackgroundVisionShader.COLOR_TINT,
            },
        },
        */
        lighting: {
            background: { visibility: VisionMode.LIGHTING_VISIBILITY.REQUIRED }
            // illumination: { visibility: VisionMode.LIGHTING_VISIBILITY.REQUIRED },
            // coloration: { visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED },
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
            // coloration: { shader: InfravisionColorationVisionShader },
        }
    });
    //             
    
    /**
     *         canvas: {
          shader: ColorAdjustmentsSamplerShader,
          uniforms: { contrast: 0, saturation: -1.0, brightness: 0 }
        },
        lighting: {
          levels: {
            [VisionMode.LIGHTING_LEVELS.DIM]: VisionMode.LIGHTING_LEVELS.BRIGHT
          },
          background: { visibility: VisionMode.LIGHTING_VISIBILITY.REQUIRED }
        },
        vision: {
          darkness: { adaptive: false },
          defaults: { attenuation: 0, contrast: 0, saturation: -1.0, brightness: 0 }
        }
      }),
      */
});