(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compactViewport = window.matchMedia('(max-width: 820px)');
  const sections = [...document.querySelectorAll('.section-light, .statement, .process, .faq')];
  if (!sections.length) return;

  const vertexShader = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main() {
      v_uv = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fragmentShader = `
    precision highp float;
    varying vec2 v_uv;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_seed;

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
        f.y
      );
    }

    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.52;
      for (int i = 0; i < 4; i++) {
        value += noise(p) * amplitude;
        p = p * 2.03 + vec2(17.1, 9.2);
        amplitude *= 0.5;
      }
      return value;
    }

    float softBand(float value, float center, float width) {
      return 1.0 - smoothstep(width * 0.38, width, abs(value - center));
    }

    void main() {
      vec2 uv = v_uv;
      float aspect = u_resolution.x / max(u_resolution.y, 1.0);
      vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);
      float t = u_time * 0.000085;

      float field = fbm(vec2(p.x * 0.70 + t + u_seed, p.y * 1.20 - t * 0.55));
      float fine = fbm(vec2(p.x * 1.52 - t * 0.34, p.y * 1.68 + u_seed));
      float sweep = p.y + p.x * 0.20 + sin(p.x * 2.0 + field * 3.5 + t * 1.8) * 0.18;

      float waveA = softBand(sweep, -0.23 + (field - 0.5) * 0.30, 0.31);
      float waveB = softBand(sweep, 0.04 + (fine - 0.5) * 0.22, 0.23);
      float waveC = softBand(sweep, 0.30 + (field - 0.5) * 0.19, 0.17);
      float filament = 1.0 - smoothstep(0.006, 0.026, abs(sweep - 0.11 - sin(p.x * 3.2 + t * 1.35) * 0.035));

      vec3 goldBase = vec3(0.855, 0.650, 0.285);
      vec3 champagne = vec3(0.960, 0.840, 0.565);
      vec3 royalGold = vec3(0.805, 0.545, 0.145);
      vec3 amber = vec3(0.635, 0.350, 0.060);
      vec3 bronze = vec3(0.310, 0.165, 0.035);

      vec3 color = goldBase;
      color = mix(color, champagne, waveA * 0.76);
      color = mix(color, royalGold, waveB * 0.78);
      color = mix(color, amber, waveC * 0.72);
      color = mix(color, bronze, filament * 0.38);

      float paper = (noise(gl_FragCoord.xy * 0.32 + u_seed) - 0.5) * 0.012;
      float edgeFade = smoothstep(0.0, 0.14, uv.x) * smoothstep(0.0, 0.14, 1.0 - uv.x);
      color += paper;
      color = mix(champagne, color, 0.88 + edgeFade * 0.10);
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  class LightWave {
    constructor(section, index) {
      this.section = section;
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'light-wave-canvas';
      this.canvas.setAttribute('aria-hidden', 'true');
      this.section.prepend(this.canvas);
      this.section.classList.add('light-wave-section');
      this.seed = index * 2.73 + 0.8;
      this.visible = false;
      this.running = false;
      this.frame = 0;
      this.startTime = performance.now() - index * 1450;
      this.resizeFrame = 0;
      this.lastDraw = 0;
      this.frameInterval = compactViewport.matches ? 1000 / 30 : 0;

      const gl = this.canvas.getContext('webgl', {
        antialias: false,
        alpha: false,
        depth: false,
        powerPreference: 'low-power'
      });
      if (!gl) {
        this.section.classList.add('light-wave-fallback');
        this.canvas.remove();
        return;
      }
      this.gl = gl;

      try {
        this.program = this.createProgram(vertexShader, fragmentShader);
        this.positionLocation = gl.getAttribLocation(this.program, 'a_position');
        this.resolutionLocation = gl.getUniformLocation(this.program, 'u_resolution');
        this.timeLocation = gl.getUniformLocation(this.program, 'u_time');
        this.seedLocation = gl.getUniformLocation(this.program, 'u_seed');
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
        gl.useProgram(this.program);
        gl.enableVertexAttribArray(this.positionLocation);
        gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);
        this.resize();
        this.render(performance.now());
      } catch (error) {
        this.section.classList.add('light-wave-fallback');
        this.canvas.remove();
        return;
      }

      this.resizeObserver = 'ResizeObserver' in window
        ? new ResizeObserver(() => this.requestResize())
        : null;
      if (this.resizeObserver) this.resizeObserver.observe(this.section);
      else window.addEventListener('resize', () => this.requestResize(), { passive: true });
    }

    createShader(type, source) {
      const shader = this.gl.createShader(type);
      this.gl.shaderSource(shader, source);
      this.gl.compileShader(shader);
      if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        throw new Error(this.gl.getShaderInfoLog(shader) || 'Gradient shader error');
      }
      return shader;
    }

    createProgram(vertex, fragment) {
      const program = this.gl.createProgram();
      this.gl.attachShader(program, this.createShader(this.gl.VERTEX_SHADER, vertex));
      this.gl.attachShader(program, this.createShader(this.gl.FRAGMENT_SHADER, fragment));
      this.gl.linkProgram(program);
      if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
        throw new Error(this.gl.getProgramInfoLog(program) || 'Gradient link error');
      }
      return program;
    }

    requestResize() {
      cancelAnimationFrame(this.resizeFrame);
      this.resizeFrame = requestAnimationFrame(() => {
        this.resize();
        this.render(performance.now());
      });
    }

    resize() {
      if (!this.gl) return;
      const rect = this.section.getBoundingClientRect();
      const dpr = compactViewport.matches
        ? Math.min(window.devicePixelRatio || 1, .9)
        : Math.min(window.devicePixelRatio || 1, 1.2);
      const maxWidth = compactViewport.matches ? 980 : 1600;
      const maxHeight = compactViewport.matches ? 720 : 920;
      const width = Math.min(Math.max(Math.round(rect.width * dpr), 1), maxWidth);
      const height = Math.min(Math.max(Math.round(rect.height * dpr), 1), maxHeight);
      if (this.canvas.width !== width || this.canvas.height !== height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.gl.viewport(0, 0, width, height);
      }
    }

    render = (now) => {
      if (!this.gl) return;
      this.frame = 0;
      if (this.running && this.frameInterval && now - this.lastDraw < this.frameInterval) {
        this.frame = requestAnimationFrame(this.render);
        return;
      }
      this.lastDraw = now;
      this.gl.useProgram(this.program);
      this.gl.uniform2f(this.resolutionLocation, this.canvas.width, this.canvas.height);
      this.gl.uniform1f(this.timeLocation, now - this.startTime);
      this.gl.uniform1f(this.seedLocation, this.seed);
      this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
      if (this.running && !reduceMotion.matches) this.frame = requestAnimationFrame(this.render);
    };

    start() {
      if (!this.gl || this.running || reduceMotion.matches || document.hidden) return;
      this.running = true;
      this.frame = requestAnimationFrame(this.render);
    }

    stop() {
      this.running = false;
      cancelAnimationFrame(this.frame);
      this.frame = 0;
    }
  }

  const waves = sections.map((section, index) => new LightWave(section, index));
  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const wave = waves.find((item) => item.section === entry.target);
          if (!wave) return;
          wave.visible = entry.isIntersecting;
          if (entry.isIntersecting) wave.start();
          else wave.stop();
        });
      }, { rootMargin: '180px 0px', threshold: 0.01 })
    : null;

  waves.forEach((wave) => {
    if (observer) observer.observe(wave.section);
    else { wave.visible = true; wave.start(); }
  });

  const updateMotion = () => {
    waves.forEach((wave) => {
      if (reduceMotion.matches) {
        wave.stop();
        wave.render(performance.now());
      } else if (wave.visible) wave.start();
    });
  };
  if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', updateMotion);
  else reduceMotion.addListener(updateMotion);

  document.addEventListener('visibilitychange', () => {
    waves.forEach((wave) => {
      if (document.hidden) wave.stop();
      else if (wave.visible) wave.start();
    });
  });
})();
