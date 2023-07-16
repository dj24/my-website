#pragma glslify: opUnion = require(../operations/union)
#pragma glslify: sdCappedCylinder = require(./capped-cylinder)
#pragma glslify: sdBox = require(./box)

float sdArch ( vec3 p, vec3 size ){
    float cylinder = sdCappedCylinder(p, size.x, size.z);
    float box = sdBox(p + vec3(0.0, size.y, 0.0), size);
    return opUnion(vec2(box, 0.0), vec2(cylinder, 0.0)).x;
}
#pragma glslify: export(sdArch)