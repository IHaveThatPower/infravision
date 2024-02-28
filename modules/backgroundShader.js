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

    // This is rather-obviously derived from a trendline
    // TODO: Replace this with some version of the tanh() used for white mode
    static BLUE_CURVE_FUNCTION = `
    float blueCurve(in float x) {
        return 2.86778398510243 * x * x * x - 4.32322426177177 * x * x + 2.44143389199256 * x - 0.00242418196328738;
    }`;

    static HYPERBOLIC_TANGENT_FUNCTION = `
    float tanh(in float x) {
        return (exp(x) - exp(-1.*x)) / (exp(x) + exp(-1.*x));
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

    ${this.GAUSSIAN_CURVE_FUNCTION}
    ${this.BLUE_CURVE_FUNCTION}

    void main(void) {
        ${this.FRAGMENT_BEGIN}
        float luminance = dot(vec3(0.30, 0.59, 0.11), baseColor.rgb);
        if (baseColor.a > alphaThreshold) {
            gl_FragColor.r = 0.;
            gl_FragColor.g = gaussianCurve(luminance, 0.5, 0.15, 0.5);
            gl_FragColor.b = blueCurve(luminance); // gaussianCurve(luminance, 0.9, 0.325, 1.021) - 0.022; // -1.*luminance*luminance + 2.*luminance;
            gl_FragColor.a = baseColor.a;
        }
        else {
            gl_FragColor = vec4(0.0);
        }
    }`;
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
    void main(void) {
        ${this.FRAGMENT_BEGIN}
        float luminance = dot(vec3(0.30, 0.59, 0.11), baseColor.rgb);
        float invLum = 1. - luminance;
        if (baseColor.a > alphaThreshold) {
            gl_FragColor.r = 0.;
            gl_FragColor.g = 0.00390625 * exp(5.54517744447956 * invLum);
            gl_FragColor.b = tanh((invLum - 0.5) * 4.) / 2.169 + (41./72.);
            gl_FragColor.a = baseColor.a;
        }
        else {
            gl_FragColor = vec4(0.0);
        }
    }`;
}
