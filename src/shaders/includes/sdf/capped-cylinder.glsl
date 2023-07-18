float sdCappedCylinder( vec3 p, float h, float r ){
    vec2 d = abs(vec2(length(p.yz),p.x)) - vec2(r,h);
    return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}