vec2 opSubtraction( vec2 d1, vec2 d2 ) {
    float t = max(-d1.x, d2.x);
    return vec2(t,d2.y);
}
#pragma glslify: export(opSubtraction)