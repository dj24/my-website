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