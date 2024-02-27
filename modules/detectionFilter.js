/**
 * Shameless rip of SWADE's infravision vision type implementation
 *
 * @author  Joseph Meehan
 * @author  FloRad
 * @author  IHaveThatPower <mcc@mcc3d.com>
 */

export class InfraVisionFilter extends AbstractBaseFilter {
    static defaultUniforms = {
        luminanceThreshold: 0.5,
        alphaThreshold: 0.1,
    };

    /**
     * fragment shader based on the following snippets:
     * @link https://www.shadertoy.com/view/4dcSDH
     * @linl https://www.geeks3d.com/20101123/shader-library-predators-thermal-vision-post-processing-filter-glsl/
     */
    static fragmentShader = `
  varying vec2 vTextureCoord;
  uniform sampler2D uSampler;
  uniform float luminanceThreshold;
  uniform float alphaThreshold;

  #define RED vec4(1.0, 0.0, 0.0, 1.0)
  #define YELLOW vec4(1.0, 1.0, 0.0, 1.0)
  #define BLUE vec4(0.0, 0.0, 1.0, 1.0)
  #define GREEN vec4(0.0, 1.0, 0.0, 1.0)

  void main(void) {
    vec4 texColor = texture2D(uSampler, vTextureCoord);
    float luminance = dot(vec3(0.30, 0.59, 0.11), texColor.rgb);
    if ( texColor.a > alphaThreshold ) {
      gl_FragColor = (luminance < luminanceThreshold) ? mix(BLUE, mix(YELLOW, GREEN, luminance / 0.5), luminance * 2.0 ) : mix(YELLOW, RED, (luminance - 0.5) * 2.0);
      gl_FragColor.rgb *= 0.1 + 0.25 + 0.75 * pow( 16.0 * vTextureCoord.x * vTextureCoord.y * (1.0 - vTextureCoord.x) * (1.0 - vTextureCoord.y), 0.15 );
      gl_FragColor.a = texColor.a;
    } else {
      gl_FragColor = vec4(0.0);
    }
  }`;
}