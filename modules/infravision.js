export class Infravision
{
    static testVisibility(result, args)
    {
        // If no vision sources are present, the visibility is dependent of the type of user
        if (!canvas.effects.visionSources.some(s => s.active)) return result;
        
        let point, options, object, t;
        [point, options] = args;
        if (options.object)
            object = options.object;
        t = (game?.canvas?.grid?.w || 50) / 2; // Default
        if (options.tolerance)
            t = options.tolerance;
        console.log('INFRAVISION | Tolerance is ', t);
        
        // Much of what follows is lifted from CanvasVisibility.testVisability
        if (!(object instanceof Token)) return false; // Special detection modes only detect tokens
        
        const sr = canvas.dimensions.sceneRect;
        const modes = CONFIG.Canvas.detectionModes;
        const inBuffer = !sr.contains(point.x, point.y); // Is the evaluation point off in the scene buffer space?
        
        // Define our test area
        const offsets = t > 0 ? [[0, 0], [-t, -t], [-t, t], [t, t], [t, -t], [-t, 0], [t, 0], [0, -t], [0, t]] : [[0, 0]];
        const config = {
          object,
          tests: offsets.map(o => ({
            point: new PIXI.Point(point.x + o[0], point.y + o[1]),
            los: new Map()
          }))
        };
        
        // Check 'em!
        for (const visionSource of canvas.effects.visionSources.values()) {
            if (!visionSource.active) continue;

            // If we're in the buffer but our vision source isn't, move along -- TODO: Determine if I want to adhere to this or not!
            if (inBuffer === sr.contains(visionSource.x, visionSource.y)) continue;

            // Get the viewing object's document (the token)
            const token = visionSource.object.document;
            console.log('================================================================================');
            console.log('INFRAVISION | Checking vision for ', token.name, 'against object', object.name);
            console.log('INFRAVISION | Config:', config);

            // If the token doesn't have Infravision, move along
            let infraMode = token.detectionModes.filter(m => m.id === 'infravision');
            if (infraMode.length === 0) continue;
            
            // Determine whether or not the current thing is visible to Infravision
            const dmInfra = modes[infraMode[0].id];
            const infraResult = dmInfra.testVisibility(visionSource, infraMode[0], config);
            console.log('INFRAVISION | Infra Result: ', infraResult);
            
            // Determine whether or not the current thing is visible to basic sight
            const basicMode = token.detectionModes.filter(m => m.id === DetectionMode.BASIC_MODE_ID)[0];
            const dmBasic = modes[DetectionMode.BASIC_MODE_ID];
            const basicResult = dmBasic?.testVisibility(visionSource, basicMode, config);
            console.log('INFRAVISION | Basic Result: ', basicResult);
            
            // If Infra can see it and Basic cannot, apply the filter
            if (infraResult === true) { // && basicResult === false) {
                object.detectionFilter = dmInfra.constructor.getDetectionFilter(); // TODO: Only apply the filter if basic doesn't also qualify?
                return true;
            }
        }
        return result;
    }
}
