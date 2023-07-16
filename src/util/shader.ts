export const operations = `
  vec2 opSmoothUnion( vec2 d1, vec2 d2, float k ) {
    float h = clamp( 0.5 + 0.5*(d2.x-d1.x)/k, 0.0, 1.0 );
    float t = mix( d2.x, d1.x, h ) - k*h*(1.0-h);
    float m = mix( d2.y, d1.y, h );
    return vec2(t,m);
  }
  
  vec2 opSmoothSubtraction( vec2 d1, vec2 d2, float k ) {
      float h = clamp( 0.5 - 0.5*(d2.x+d1.x)/k, 0.0, 1.0 );
      float t = mix( d2.x, -d1.x, h ) + k*h*(1.0-h); 
      float m = d2.y;
      return vec2(t,m);
  }
  
  float opUnion( float d1, float d2 ) { return (d1<d2) ? d1 : d2; }
  vec2 opUnion( vec2 d1, vec2 d2 ) { return (d1.x<d2.x) ? d1 : d2; }
  
  vec2 opSubtraction( vec2 d1, vec2 d2 ) {
    float t = max(-d1.x, d2.x);
    return vec2(t,d2.y);
  }
  float opIntersection( float d1, float d2 ) { return max(d1,d2); }
`;
export const distanceFunctions = `
  float sdTriPrism( vec3 p, vec2 h )
  {
    vec3 q = abs(p);
    return max(q.z-h.y,max(q.x*0.866025+p.y*0.5,-p.y)-h.x*0.5);
  }
  
  float sdBox( vec3 p, vec3 b )
  {
    vec3 q = abs(p) - b;
    return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
  }
  
  float sdSphere( vec3 p, float s )
  {
    return length(p)-s;
  }
  
  float sdCappedCylinder( vec3 p, float h, float r )
  {
    vec2 d = abs(vec2(length(p.yz),p.x)) - vec2(r,h);
    return min(max(d.x,d.y),0.0) + length(max(d,0.0));
  }
  
  float sdArch ( vec3 p, vec3 size )
  {
    float cylinder = sdCappedCylinder(p, size.x, size.z);
    float box = sdBox(p + vec3(0.0, size.y, 0.0), size);
    return opUnion(box, cylinder);
  }
  
`;
export const vertexShaderSource = `
  attribute vec4 aVertexPosition;
  void main() {
    gl_Position = aVertexPosition;
  }
`;
