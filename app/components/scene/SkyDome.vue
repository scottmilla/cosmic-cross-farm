<script setup lang="ts">
// A wet-on-wet watercolour sky: warm reds/oranges/yellows streaming diagonally through cool blue-violet,
// colours bleeding into each other with no outlines, over visible paper grain. Slowly flowing.
const uniforms = { uTime: { value: 0 } }
const { onBeforeRender } = useLoop()
onBeforeRender(({ elapsed }) => {
  uniforms.uTime.value = elapsed
})

const vertexShader = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const fragmentShader = /* glsl */ `
  varying vec3 vDir;
  uniform float uTime;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 11.7; a *= 0.5; }
    return v;
  }

  void main() {
    vec3 d = normalize(vDir);
    float el = max(d.y, 0.0);
    vec2 p = vec2(atan(d.x, -d.z) * 1.3, el * 2.2);
    float t = uTime * 0.025;

    // domain-warped flow so colour streams swirl and merge like wet paint
    vec2 q = vec2(fbm(p * 0.9 + vec2(0.0, t)), fbm(p * 0.9 + vec2(5.2, 1.3 - t)));
    vec2 r = vec2(fbm(p + 2.0 * q + vec2(1.7, 9.2) + t), fbm(p + 2.0 * q + vec2(8.3, 2.8) - t));
    float f = fbm(p + 2.4 * r);

    // diagonal streak coordinate, as in the flame-like bands of the paintings
    float s = p.x * 0.8 + p.y * 1.6 + f * 2.6 + r.x * 1.2;
    float band = 0.5 + 0.5 * sin(s * 1.9);
    float band2 = 0.5 + 0.5 * sin(s * 0.8 + 1.7 + q.y * 1.2);

    vec3 blue = vec3(0.36, 0.50, 0.82);
    vec3 violet = vec3(0.56, 0.45, 0.80);
    vec3 rose = vec3(1.0, 0.54, 0.62);
    vec3 orange = vec3(1.0, 0.62, 0.28);
    vec3 yellow = vec3(1.0, 0.85, 0.36);

    vec3 col = mix(blue, violet, smoothstep(0.2, 0.8, band2));
    col = mix(col, rose, smoothstep(0.35, 0.75, band));
    col = mix(col, orange, smoothstep(0.5, 0.9, band * band2 * 1.7));
    col = mix(col, yellow, smoothstep(0.7, 0.98, f * band * 1.5));

    // warmth gathers at the horizon, coolness deepens toward the zenith
    col = mix(col, mix(orange, yellow, f), (1.0 - smoothstep(0.0, 0.5, el)) * 0.5);
    col = mix(col, mix(blue, violet, f), smoothstep(0.55, 1.0, el) * 0.5);

    // paper grain and soft pigment pooling
    float grain = noise(gl_FragCoord.xy * 0.9) * 0.6 + noise(gl_FragCoord.xy * 0.25) * 0.4;
    col *= 0.93 + 0.1 * grain;
    col *= 0.93 + 0.1 * smoothstep(0.0, 0.5, abs(band - 0.5) * 2.0);
    gl_FragColor = vec4(col, 1.0);
  }
`
</script>

<template>
  <TresMesh :position="[0, -20, -20]" :scale="[1, 1.2, 1]">
    <TresSphereGeometry :args="[150, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2 + 0.25]" />
    <TresShaderMaterial :uniforms="uniforms" :vertex-shader="vertexShader" :fragment-shader="fragmentShader" :side="1" :depth-write="false" :fog="false" />
  </TresMesh>
</template>
