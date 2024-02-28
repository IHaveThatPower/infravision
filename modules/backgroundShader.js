/**
 * Shader to alter the background color within the Infravision vision
 * type, with the dominant colors ranging from black to bright blue,
 * with some green mixed in near the midpoint.
 *
 * Work in progress.
 *
 * @author    IHaveThatPower <mcc@mcc3d.com>
 */

export class InfravisionColorationVisionShaderBase extends ColorationVisionShader {
    static GAUSSIAN_CURVE_FUNCTION = `
    float gaussianCurve(in float x, in float offset, in float sigma, in float coeff) {
        float xOffset = x - offset;
        return coeff * exp(-1. * (xOffset * xOffset) / (2. * sigma * sigma));
    }`;

    static HYPERBOLIC_TANGENT_FUNCTION = `
    float tanh(in float x) {
        return (exp(x) - exp(-1.*x)) / (exp(x) + exp(-1.*x));
    }`;

    static COMPUTE_LUMA_FUNCTION = `
    float computeLuminance(in vec3 baseColor) {
        return dot(vec3(0.30, 0.59, 0.11), baseColor.rgb);
    }`;

    static INFRAVISION_BACKGROUND_FUNCTION = `
    vec3 infravision(in float x) {
        return vec3(
            0.,
            0.00390625 * exp(5.54517744447956 * x),
            tanh((x - 0.5) * 4. ) / 2.169 + (41./72.)
        );
    }`;

    static MAIN_INFRAVISION_FRAGMENT = `
    void main(void) {
        ${this.FRAGMENT_BEGIN}
        float x = getInputValue(baseColor.rgb);
        if (baseColor.a > alphaThreshold) {
            gl_FragColor.rgb = infravision(x);
            gl_FragColor.a = baseColor.a;
        }
        else {
            gl_FragColor = vec4(0.0);
        }
    }`;

    static fragmentShader = "";

    /** @inheritdoc */
    static defaultUniforms = ({...super.defaultUniforms, useSampler: true});

    /** @inheritdoc */
    get isRequired() {
        return true;
    }
}

/**
 * Fragment shader used when the "black" setting is enabled
 */
export class InfravisionColorationVisionShaderBlack extends InfravisionColorationVisionShaderBase {
    static fragmentShader = `
    ${this.SHADER_HEADER}
    ${this.PERCEIVED_BRIGHTNESS}
    uniform float alphaThreshold;

    ${this.HYPERBOLIC_TANGENT_FUNCTION}
    ${this.COMPUTE_LUMA_FUNCTION}
    ${this.INFRAVISION_BACKGROUND_FUNCTION}

    float getInputValue(in vec3 baseColor) {
        return computeLuminance(baseColor);
    }

    ${this.MAIN_INFRAVISION_FRAGMENT}`;
}

/**
 * Fragment shader used when the "white" setting is enabled
 */
export class InfravisionColorationVisionShaderWhite extends InfravisionColorationVisionShaderBase {
    static fragmentShader = `
    ${this.SHADER_HEADER}
    ${this.PERCEIVED_BRIGHTNESS}
    uniform float alphaThreshold;

    ${this.HYPERBOLIC_TANGENT_FUNCTION}
    ${this.COMPUTE_LUMA_FUNCTION}
    ${this.INFRAVISION_BACKGROUND_FUNCTION}

    float getInputValue(in vec3 baseColor) {
        return 1. - computeLuminance(baseColor);
    }

    ${this.MAIN_INFRAVISION_FRAGMENT}`;
}
