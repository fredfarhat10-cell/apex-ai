"use client"

import { useEffect, useRef, useState } from "react"

interface Orb3DProps {
  state: "idle" | "thinking" | "replying"
  scenario?: "fitness" | "writing" | "productivity"
}

export function Orb3D({ state, scenario = "fitness" }: Orb3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [webglSupported, setWebglSupported] = useState(true)

  useEffect(() => {
    // Check WebGL support
    const canvas = document.createElement("canvas")
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    if (!gl) {
      setWebglSupported(false)
      return
    }

    // Dynamic import Three.js only when needed
    import("three").then(
      ({
        Scene,
        PerspectiveCamera,
        WebGLRenderer,
        IcosahedronGeometry,
        MeshStandardMaterial,
        Mesh,
        PointLight,
        AmbientLight,
        Color,
      }) => {
        if (!canvasRef.current) return

        const scene = new Scene()
        const camera = new PerspectiveCamera(75, 1, 0.1, 1000)
        const renderer = new WebGLRenderer({
          canvas: canvasRef.current,
          alpha: true,
          antialias: true,
        })

        renderer.setSize(300, 300)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        camera.position.z = 2.5

        // Create orb geometry
        const geometry = new IcosahedronGeometry(1, 2)
        const material = new MeshStandardMaterial({
          color: new Color(0x00ffff),
          emissive: new Color(0x00ffff),
          emissiveIntensity: 0.3,
          metalness: 0.8,
          roughness: 0.2,
          wireframe: false,
        })

        const orb = new Mesh(geometry, material)
        scene.add(orb)

        // Lighting
        const pointLight = new PointLight(0x00ffff, 1, 100)
        pointLight.position.set(2, 2, 2)
        scene.add(pointLight)

        const ambientLight = new AmbientLight(0x00ccff, 0.5)
        scene.add(ambientLight)

        // Animation variables
        let baseScale = 1
        let targetScale = 1
        let pulseIntensity = 0.3
        let rotationSpeed = 0.005

        // Animation loop
        function animate() {
          requestAnimationFrame(animate)

          // Smooth scale transition
          baseScale += (targetScale - baseScale) * 0.1

          // Breathing animation
          const breathe = Math.sin(Date.now() * 0.001) * 0.02
          orb.scale.setScalar(baseScale + breathe)

          // Rotation
          orb.rotation.x += rotationSpeed
          orb.rotation.y += rotationSpeed * 1.5

          // Update emissive based on state
          material.emissiveIntensity = pulseIntensity + Math.sin(Date.now() * 0.003) * 0.1

          renderer.render(scene, camera)
        }

        animate()

        // Update based on state
        const updateState = () => {
          switch (state) {
            case "thinking":
              targetScale = 1.08
              pulseIntensity = 0.6
              rotationSpeed = 0.01
              break
            case "replying":
              targetScale = 1.05
              pulseIntensity = 0.8
              rotationSpeed = 0.015
              // Quick burst effect
              setTimeout(() => {
                targetScale = 1
                pulseIntensity = 0.3
                rotationSpeed = 0.005
              }, 420)
              break
            default:
              targetScale = 1
              pulseIntensity = 0.3
              rotationSpeed = 0.005
          }
        }

        updateState()

        // Cleanup
        return () => {
          renderer.dispose()
          geometry.dispose()
          material.dispose()
        }
      },
    )
  }, [state])

  if (!webglSupported) {
    return (
      <div
        className={`w-[300px] h-[300px] flex items-center justify-center transition-transform duration-600 ${
          state === "thinking" ? "scale-108" : state === "replying" ? "scale-105" : "scale-100"
        }`}
      >
        <svg width="200" height="200" viewBox="0 0 200 200" className="text-apex-primary">
          <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
          <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5" />
          <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.7" />
          <circle
            cx="100"
            cy="100"
            r="20"
            fill="currentColor"
            opacity="0.8"
            className={state === "thinking" ? "animate-pulse-ring" : ""}
          />
        </svg>
      </div>
    )
  }

  return (
    <div className="relative w-[300px] h-[300px]">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div
        className={`absolute inset-0 rounded-full pointer-events-none transition-all duration-900 ${
          state === "thinking" ? "animate-glow-pulse" : state === "replying" ? "glow-cyan-strong" : "glow-cyan"
        }`}
      />
    </div>
  )
}
