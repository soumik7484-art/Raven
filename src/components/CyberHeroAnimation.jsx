import { useEffect, useRef } from 'react'

/**
 * CyberHeroAnimation — Raven
 *
 * Polished 3D Minecraft-inspired cybersecurity animation.
 * Features 3D voxel characters: Hacker typing at laptop, Blue Protector defending with shield,
 * and Red Attacker archer firing malware arrows, rendered with a transparent background
 * via hardware-accelerated WebGL directly over the website's original background.
 */
export default function CyberHeroAnimation() {
  const canvasRef = useRef(null)
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    video.muted = true
    video.defaultMuted = true
    video.volume = 0
    video.playsInline = true
    video.loop = true
    video.setAttribute('muted', '')
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', '')
    video.setAttribute('loop', '')
    video.onvolumechange = () => {
      video.muted = true
      video.volume = 0
    }

    const playPromise = video.play()
    if (playPromise !== undefined) {
      playPromise.catch(() => {})
    }

    let gl = null
    try {
      gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: true }) ||
           canvas.getContext('experimental-webgl', { alpha: true, premultipliedAlpha: false })
    } catch {
      gl = null
    }

    let animationFrameId = null

    if (gl) {
      // ── WebGL Shader Setup ──
      const vsSource = `
        attribute vec2 a_position;
        attribute vec2 a_texCoord;
        varying vec2 v_texCoord;
        void main() {
          gl_Position = vec4(a_position, 0.0, 1.0);
          v_texCoord = a_texCoord;
        }
      `

      // Key out pure black background with smooth edge transition
      const fsSource = `
        precision mediump float;
        uniform sampler2D u_image;
        varying vec2 v_texCoord;
        void main() {
          vec4 color = texture2D(u_image, v_texCoord);
          float maxVal = max(color.r, max(color.g, color.b));
          float alpha = smoothstep(0.015, 0.055, maxVal);
          gl_FragColor = vec4(color.rgb, color.a * alpha);
        }
      `

      const createShader = (type, source) => {
        const shader = gl.createShader(type)
        gl.shaderSource(shader, source)
        gl.compileShader(shader)
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          gl.deleteShader(shader)
          return null
        }
        return shader
      }

      const program = gl.createProgram()
      const vs = createShader(gl.VERTEX_SHADER, vsSource)
      const fs = createShader(gl.FRAGMENT_SHADER, fsSource)
      if (vs && fs) {
        gl.attachShader(program, vs)
        gl.attachShader(program, fs)
        gl.linkProgram(program)
      }

      const positionLocation = gl.getAttribLocation(program, 'a_position')
      const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord')

      // Quad geometry
      const positionBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
         1.0,  1.0,
      ]), gl.STATIC_DRAW)

      const texCoordBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.0, 1.0,
        1.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
      ]), gl.STATIC_DRAW)

      // Video texture
      const texture = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

      gl.useProgram(program)

      gl.enableVertexAttribArray(positionLocation)
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

      gl.enableVertexAttribArray(texCoordLocation)
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
      gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0)

      const render = () => {
        if (video.readyState >= 2) {
          gl.viewport(0, 0, canvas.width, canvas.height)
          gl.clearColor(0, 0, 0, 0)
          gl.clear(gl.COLOR_BUFFER_BIT)

          gl.bindTexture(gl.TEXTURE_2D, texture)
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
        }
        animationFrameId = requestAnimationFrame(render)
      }
      render()
    } else {
      // 2D Canvas Fallback
      const ctx = canvas.getContext('2d')
      const render2d = () => {
        if (video.readyState >= 2 && ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const d = imgData.data
          for (let i = 0; i < d.length; i += 4) {
            const maxVal = Math.max(d[i], d[i + 1], d[i + 2])
            if (maxVal <= 4) {
              d[i + 3] = 0
            } else if (maxVal < 14) {
              d[i + 3] = Math.round(((maxVal - 4) / 10) * 255)
            }
          }
          ctx.putImageData(imgData, 0, 0)
        }
        animationFrameId = requestAnimationFrame(render2d)
      }
      render2d()
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div
      id="hero-island"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '540px',
        aspectRatio: '720 / 240',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'float 5s ease-in-out infinite',
        willChange: 'transform',
      }}
    >
      {/* Hidden source video feeding the WebGL canvas */}
      <video
        ref={videoRef}
        src="/loop.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        style={{ display: 'none' }}
      >
        <source src="/loop.mp4" type="video/mp4" />
      </video>

      {/* Hardware-accelerated transparent WebGL canvas */}
      <canvas
        ref={canvasRef}
        width={720}
        height={240}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
          backgroundColor: 'transparent',
          filter: 'drop-shadow(0 12px 24px rgba(44, 36, 22, 0.12))',
        }}
      />
    </div>
  )
}
