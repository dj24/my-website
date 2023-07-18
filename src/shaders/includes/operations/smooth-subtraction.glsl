vec2 opSmoothSubtraction( vec2 d1, vec2 d2, float k ) {
      float h = clamp( 0.5 - 0.5*(d2.x+d1.x)/k, 0.0, 1.0 );
      float t = mix( d2.x, -d1.x, h ) + k*h*(1.0-h); 
      float m = d2.y;
      return vec2(t,m);
}