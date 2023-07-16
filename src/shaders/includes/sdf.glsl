
float sdTriPrism( vec3 p, vec2 h ){
    vec3 q = abs(p);
    return max(q.z-h.y,max(q.x*0.866025+p.y*0.5,-p.y)-h.x*0.5);
}
  
float sdBox( vec3 p, vec3 b ){
    vec3 q = abs(p) - b;
    return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}
  
float sdSphere( vec3 p, float s ){
    return length(p)-s;
}
  
float sdCappedCylinder( vec3 p, float h, float r ){
    vec2 d = abs(vec2(length(p.yz),p.x)) - vec2(r,h);
    return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}