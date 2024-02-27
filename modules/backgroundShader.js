/**
 * Shader to alter the background color within the Infravision vision
 * type, with the dominant colors ranging from black to bright blue,
 * with some green mixed in near the midpoint.
 *
 * Work in progress.
 *
 * @author  IHaveThatPower <mcc@mcc3d.com>
 */

export class InfravisionColorationVisionShader extends ColorationVisionShader {
    static fragmentShader = `
  ${this.SHADER_HEADER}
  ${this.PERCEIVED_BRIGHTNESS}
  uniform float luminanceThreshold;
  uniform float alphaThreshold;

  #define RED vec4(1.0, 0.0, 0.0, 1.0)
  #define YELLOW vec4(1.0, 1.0, 0.0, 1.0)
  #define BLUE vec4(0.0, 0.0, 1.0, 1.0)
  #define GREEN vec4(0.0, 1.0, 0.0, 1.0)

  float gaussianCurve(in float x, in float offset, in float sigma, in float coeff) {
    float xOffset = x - offset;
    return coeff * exp(-1. * (xOffset * xOffset) / (2. * sigma * sigma));
  }

  void main(void) {
    ${this.FRAGMENT_BEGIN}
    float luminance = dot(vec3(0.30, 0.59, 0.11), baseColor.rgb);
    if (baseColor.a > alphaThreshold) {
      gl_FragColor.r = 0.;
      gl_FragColor.g = gaussianCurve(luminance, 0.5, 0.15, 0.5);
      gl_FragColor.b = gaussianCurve(luminance, 0.9, 0.325, 1.021) - 0.022; // -1.*luminance*luminance + 2.*luminance;
      gl_FragColor.a = baseColor.a;
    }
    else {
      gl_FragColor = vec4(0.0);
    }
  }`;

  /** @inheritdoc */
  static defaultUniforms = ({...super.defaultUniforms, useSampler: true});

  /** @inheritdoc */
  get isRequired() {
    return true;
  }
}
