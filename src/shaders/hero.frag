precision mediump float;

#pragma glslify: sdBox = require(./includes/sdf/box)
#pragma glslify: sdCappedCylinder = require(./includes/sdf/capped-cylinder)
#pragma glslify: sdArch = require(./includes/sdf/arch)
#pragma glslify: sdSphere = require(./includes/sdf/sphere)
#pragma glslify: opUnion = require(./includes/operations/union)
#pragma glslify: opSmoothUnion = require(./includes/operations/smooth-union)
#pragma glslify: opSubtraction = require(./includes/operations/subtraction)
#pragma glslify: hsv2rgb = require(./includes/colour/hsv2rgb)

uniform float time;
uniform float rotation;
uniform vec3 resolution;

#define BACKGROUND_COLOUR vec3(0.98, 0.929, 0.804)
#define MAX_RAY_DISTANCE 200
#define AA 2
#define ORTHO_SIZE 150.0

vec3 getColour(float hue){
    return hsv2rgb(vec3(hue, 1.0, 1.0));
}

vec2 map(vec3 pos)
{
    float sinTime = sin(time * 0.001) - 1.0;
    vec3 spherePos = pos + vec3(0.0, sinTime * 10.0, 0.0);
    
    float outerBoxColour = 0.3;
    float sphereColour = sinTime * 0.25;
    
    vec2 outerBox = vec2(sdBox(pos + vec3(0.0,90.0,0.0), vec3(20.0, 100.0, 95.0)),outerBoxColour);
    
    float archY = 22.0;
    vec3 archSize = vec3(21.0, 100.0, 22.0);
    
    vec2 arch1 = vec2(sdArch(pos + vec3(0.0,archY,0.0), archSize), 0.0);
    vec2 arch2 = vec2(sdArch(pos + vec3(0.0,archY,60.0), archSize), 0.0);
    vec2 arch3 = vec2(sdArch(pos + vec3(0.0,archY,-60.0), archSize), 0.0);
    vec2 sphere = vec2(sdSphere(spherePos, 20.0), sphereColour);
    
    vec2 res = outerBox;
    res = opSubtraction(arch1,res);
    res = opSubtraction(arch2,res);
    res = opSubtraction(arch3,res);
    res = opSmoothUnion(res, sphere, 16.0);
    return res;
} 

vec3 calcNormal(vec3 p )
{
    const float h = 0.0001;
    const vec2 k = vec2(1.0,-1.0);
    return normalize( k.xyy*map( p + k.xyy*h ).x + 
                        k.yyx*map( p + k.yyx*h ).x + 
                        k.yxy*map( p + k.yxy*h ).x + 
                        k.xxx*map( p + k.xxx*h ).x );
}

vec4 rayMarch(vec3 ro, vec3 rd, vec2 p){
    vec2 res = vec2(-1.0,-1.0);
    int j = 0;
    float t = 0.0;
    for(int i = 0; i < MAX_RAY_DISTANCE; i++)
    {
    vec2 h = map( ro+rd*t );
    if( abs(h.x)<(0.0001*t) )
    { 
        res = vec2(t,h.y); 
        break;
    }
    t += h.x;
    j++;
    if(j == MAX_RAY_DISTANCE){
        return vec4(0.0);
    }
    }
    t = res.x;
    float m = res.y;
    vec3 col = getColour(m);
    vec3 pos = ro + t*rd;
    vec3 nor = calcNormal( pos );
    
    vec3 lightDir = normalize(vec3(0.33,0.66,1.0));
    float diff = max(0.0, dot(nor, lightDir));
    col = col*diff;
    // return vec4(p.x > 0.0 ? col : nor,1.0);
    return vec4(col, 1.0);
}

void main(){
    vec4 tot = vec4(0.0);
    for( int m=0; m<AA; m++ )
    for( int n=0; n<AA; n++ )
    {
        vec2 o = vec2(float(m),float(n)) / float(AA) - 0.5;
        vec2 s_pos = (2.0*(gl_FragCoord.xy + o)-resolution.xy)/resolution.y;
        vec3 up = vec3(0.0, 1.0, 0.0);
        vec3 c_pos = vec3(ORTHO_SIZE);
        vec3 c_targ = vec3(0.0, 0.0, 0.0);
        vec3 c_dir = normalize(c_targ - c_pos);
        vec3 c_right = cross(c_dir, up);
        vec3 c_up = cross(c_right, c_dir);
        vec3 rd = normalize(c_dir);
        vec3 ro = c_pos + c_right * ORTHO_SIZE * s_pos.x + c_up * ORTHO_SIZE * s_pos.y;
        vec4 col = rayMarch(ro, rd, s_pos);
        tot += col;
    }
    tot /= float(AA*AA);
    gl_FragColor = tot;
}