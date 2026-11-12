import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, useGLTF } from '@react-three/drei'
import gsap from 'gsap'
import { Box3, Vector3, Group as ThreeGroup } from 'three'
import { CAR_Y_OFFSET, END_X, MODEL_PATH, SIDE_ROTATION, START_X, TARGET_LENGTH } from './fordHeroConfig'

function CarModel({ onReady }: { onReady: () => void }) {
  const { scene } = useGLTF(MODEL_PATH)
  const pivotRef = useRef<ThreeGroup>(null)
  const shadowRef = useRef<ThreeGroup>(null)
  const onReadyRef = useRef(onReady)
  const { camera } = useThree()

  onReadyRef.current = onReady

  // Pre-calculate centering and scaling so it renders synchronously on frame 1
  const { clonedScene, scale, y } = useMemo(() => {
    const cloned = scene.clone()
    
    // 1. Center
    const box = new Box3().setFromObject(cloned)
    if (!box.isEmpty()) {
      const center = box.getCenter(new Vector3())
      cloned.position.sub(center)
    }

    // 2. Measure and scale
    const tempPivot = new ThreeGroup()
    tempPivot.rotation.set(0, SIDE_ROTATION, 0)
    tempPivot.add(cloned)
    tempPivot.updateMatrixWorld(true)

    const bounds = new Box3().setFromObject(tempPivot)
    let s = 1
    if (!bounds.isEmpty()) {
      const size = bounds.getSize(new Vector3())
      const length = Math.max(size.x, size.z)
      if (length > 0) {
        s = TARGET_LENGTH / length
      }
    }
    
    tempPivot.scale.setScalar(s)
    tempPivot.updateMatrixWorld(true)
    
    // 3. Find ground offset
    const grounded = new Box3().setFromObject(tempPivot)
    const groundY = grounded.isEmpty() ? 0 : -grounded.min.y
    const finalY = groundY + CAR_Y_OFFSET
    
    return { clonedScene: cloned, scale: s, y: finalY }
  }, [scene])

  // Setup initial camera
  useEffect(() => {
    camera.position.set(0, 1.2, 10)
    camera.lookAt(0, 0.2, 0)
    camera.updateProjectionMatrix()
  }, [camera])

  // Animate entry
  useEffect(() => {
    const pivot = pivotRef.current
    const shadow = shadowRef.current
    if (!pivot || !shadow) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    pivot.position.set(reducedMotion ? END_X : START_X, y, 0)
    shadow.position.set(reducedMotion ? END_X : START_X, 0, 0)

    if (reducedMotion) {
      onReadyRef.current()
      return
    }

    const tl = gsap.timeline({
      onComplete: () => {
        pivot.position.x = END_X
        shadow.position.x = END_X
        onReadyRef.current()
      },
    })

    tl.to(pivot.position, { x: END_X, duration: 3.2, ease: 'power3.out' }, 0)
    tl.to(shadow.position, { x: END_X, duration: 3.2, ease: 'power3.out' }, 0)

    return () => {
      tl.kill()
    }
  }, [y])

  return (
    <>
      <group ref={pivotRef} position={[START_X, y, 0]} rotation={[0, SIDE_ROTATION, 0]} scale={scale}>
        <primitive object={clonedScene} />
      </group>
      <group ref={shadowRef} position={[START_X, 0, 0]}>
        <ContactShadows frames={1} resolution={512} position={[0, -0.02, 0]} opacity={0.4} scale={22} blur={2.8} far={4} />
      </group>
    </>
  )
}

function Scene({ onReady }: { onReady: () => void }) {
  return (
    <>
      <ambientLight intensity={0.65} />
      <hemisphereLight intensity={0.75} groundColor="#ececec" color="#ffffff" />
      <directionalLight position={[0, 8, 10]} intensity={1.5} castShadow />
      <directionalLight position={[0, 4, -8]} intensity={0.8} />
      <directionalLight position={[6, 2, 0]} intensity={0.5} />
      <directionalLight position={[-5, 3, 2]} intensity={0.5} />
      <Environment preset="city" />
      <CarModel onReady={onReady} />
    </>
  )
}

type FordHero3DProps = {
  onAnimationComplete?: () => void
  onLoaded?: () => void
}

export default function FordHero3D({ onAnimationComplete, onLoaded }: FordHero3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [modelReady, setModelReady] = useState(false)

  // Fire onLoaded as soon as the component mounts (after Suspense resolves)
  // RequestAnimationFrame ensures we wait 1 frame for shaders to compile
  useEffect(() => {
    requestAnimationFrame(() => {
      onLoaded?.()
    })
  }, [onLoaded])

  const handleReady = useCallback(() => {
    setModelReady(true)
    onAnimationComplete?.()
  }, [onAnimationComplete])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      gsap.set(container, { opacity: 1 })
      return
    }
    gsap.to(container, { opacity: 1, duration: 0.45, ease: 'power2.out' })
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track || !modelReady) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      gsap.set(track, { scaleX: 1, opacity: 1 })
      return
    }
    gsap.set(track, { scaleX: 0, opacity: 0 })
    const tl = gsap.timeline()
    tl.to(track, { scaleX: 1, opacity: 1, duration: 2.6, ease: 'power2.out' }, 0.2)
    return () => {
      tl.kill()
    }
  }, [modelReady])

  return (
    <div ref={containerRef} className="ford-hero-3d">
      <div ref={trackRef} className="ford-hero-3d__track" aria-hidden />

      <Canvas
        className="ford-hero-3d__canvas"
        camera={{ position: [0, 1.2, 10], fov: 40, near: 0.1, far: 100 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
      >
        <Scene onReady={handleReady} />
      </Canvas>
    </div>
  )
}

useGLTF.preload(MODEL_PATH)
