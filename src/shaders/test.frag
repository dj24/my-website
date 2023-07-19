precision mediump float;

uniform vec2 resolution;
uniform sampler2D image;


void main( )
{
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 col = texture2D(image, vec2(uv.x, -uv.y));
    gl_FragColor = col;
}