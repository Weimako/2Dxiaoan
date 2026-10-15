import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js'
import mascotFallback from '../assets/mascot-scene.png'
import { XiaoanChatStatus } from '../services/chatService'
import xiaoanModelUrl from '../model/xiaoan.glb?url'

export interface Xiaoan3DProps {
  size?: 'small' | 'medium' | 'large'
  isSpeaking?: boolean
  status?: XiaoanChatStatus
  interactive?: boolean
  className?: string
  onClick?: () => void
}

const MODEL_PATH = xiaoanModelUrl || '/models/xiaoan.glb'

// Inner model component inside Canvas
function XiaoanModel({
  isSpeaking = false,
  status = 'idle',
  interactive = true,
  onClick,
}: {
  isSpeaking?: boolean
  status?: XiaoanChatStatus
  interactive?: boolean
  onClick?: () => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  const modelRef = useRef<THREE.Group>(null)

  // Load GLTF from src/model/xiaoan.glb
  const { scene, animations } = useGLTF(MODEL_PATH)

  // Clone scene for multi-instance safety
  const clonedScene = useMemo(() => {
    const clone = SkeletonUtils.clone(scene) as THREE.Group
    // Ensure all materials are properly set for gentle, bright, soft healing lighting
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        if (mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
          mats.forEach((mat) => {
            mat.needsUpdate = true
            if (mat.name === 'eye') {
              // Eyes: lively, shiny, clear
              if ('metalness' in mat && typeof mat.metalness === 'number') (mat as any).metalness = 0.05
              if ('roughness' in mat && typeof mat.roughness === 'number') (mat as any).roughness = 0.22
            } else if (mat.name === 'mouth_mat') {
              // Mouth: clean pink, non-metallic
              if ('metalness' in mat && typeof mat.metalness === 'number') (mat as any).metalness = 0.0
              if ('roughness' in mat && typeof mat.roughness === 'number') (mat as any).roughness = 0.48
            } else {
              // Green fur body: eliminate dark metallic absorbing patches, soft matte plush fur
              if ('metalness' in mat && typeof mat.metalness === 'number') (mat as any).metalness = 0.0
              if ('roughness' in mat && typeof mat.roughness === 'number') (mat as any).roughness = 0.70
            }
          })
        }
      }
    })
    return clone
  }, [scene])

  // Extract animation actions
  const { actions } = useAnimations(animations, modelRef)
  const isWavingRef = useRef(false)
  const isBlinkingRef = useRef(false)
  const blinkTimerRef = useRef<number | null>(null)
  const blinkEndTimerRef = useRef<number | null>(null)

  // Find mouth mesh for speaking animation morph target
  const mouthMeshRef = useRef<THREE.Mesh | null>(null)
  // Collect eye & orbit meshes for robust zero-influence verification after blinking
  const eyeMeshesRef = useRef<THREE.Mesh[]>([])

  useEffect(() => {
    const eyeMeshes: THREE.Mesh[] = []
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        if (mesh.morphTargetDictionary) {
          if ('mouth_open' in mesh.morphTargetDictionary || '嘴巴' in mesh.morphTargetDictionary) {
            mouthMeshRef.current = mesh
          }
          if (
            'left' in mesh.morphTargetDictionary ||
            'right' in mesh.morphTargetDictionary ||
            '眼眶' in mesh.morphTargetDictionary
          ) {
            eyeMeshes.push(mesh)
          }
        }
      }
    })
    eyeMeshesRef.current = eyeMeshes
  }, [clonedScene])

  // Effective status calculation
  const isLocked = status === 'turningToFront' || status === 'speaking'
  const isActuallySpeaking =
    status === 'speaking' || (isSpeaking && status !== 'turningToFront' && status !== 'thinking')

  // 1. Idle animation:
  // 当进入转向正面或讲话状态时，平滑减弱待机起伏，确保讲话时身体稳定；讲话结束后恢复待机呼吸
  useEffect(() => {
    const idleAction = actions['Idle']
    if (!idleAction) return

    if (isLocked) {
      idleAction.fadeOut(0.2)
    } else {
      idleAction.reset().fadeIn(0.35).play()
    }
  }, [actions, isLocked])

  // 2. Synchronized Blink Group:
  // 核心要求：将「左眼闭眼」、「右眼闭眼」、「眼眶闭眼」三个动画封装为同步动作组
  // 同步启动、一致速度、同时结束、只播一次，并在结束后彻底复位眼睛，绝不停留在闭合状态
  const playBlink = useCallback(() => {
    // 若当前已有眨眼在播放，禁止重叠触发
    if (isBlinkingRef.current) return

    const leftBlink = actions['左眼闭眼']
    const rightBlink = actions['右眼闭眼']
    const orbitBlink = actions['眼眶闭眼']

    // 严苛保证：三个动画必须同时齐备，缺一不可！绝不单独播放左眼、右眼或眼眶
    if (!leftBlink || !rightBlink || !orbitBlink) return

    isBlinkingRef.current = true

    const blinkGroup = [leftBlink, rightBlink, orbitBlink]

    // 统筹三个动画的时长（在 Blender 导出数据中，三者均为 0.4167 秒）
    const duration = Math.max(
      leftBlink.getClip().duration || 0.4167,
      rightBlink.getClip().duration || 0.4167,
      orbitBlink.getClip().duration || 0.4167,
      0.4167
    )

    // 同步启动三个动画：一致起始帧、一致播放速度、只播放一次 (LoopOnce)
    blinkGroup.forEach((action) => {
      action.stop()
      action.reset()
      action.setLoop(THREE.LoopOnce, 1)
      action.clampWhenFinished = false
      action.timeScale = 1.0
      action.setEffectiveWeight(1.0)
      action.setEffectiveTimeScale(1.0)
      action.play()
    })

    // 清理可能遗留的结束定时器
    if (blinkEndTimerRef.current !== null) {
      window.clearTimeout(blinkEndTimerRef.current)
    }

    // 眨眼动画结束：停止动作并显式复位 morphTargetInfluences 为 0，确保眼睛自然睁开
    blinkEndTimerRef.current = window.setTimeout(() => {
      blinkGroup.forEach((action) => {
        action.stop()
      })
      eyeMeshesRef.current.forEach((mesh) => {
        if (mesh.morphTargetInfluences) {
          for (let i = 0; i < mesh.morphTargetInfluences.length; i++) {
            mesh.morphTargetInfluences[i] = 0
          }
        }
      })
      isBlinkingRef.current = false
      blinkEndTimerRef.current = null
    }, Math.ceil(duration * 1000) + 20)
  }, [actions])

  // 3. Natural Random Blink Scheduling:
  // 正常待机、倾听或交互时，每隔约 3～7 秒随机触发一次完整的同步眨眼
  // 页面进入后台时暂停调度，页面切回时重新安排自然眨眼
  useEffect(() => {
    const leftBlink = actions['左眼闭眼']
    const rightBlink = actions['右眼闭眼']
    const orbitBlink = actions['眼眶闭眼']

    if (!leftBlink || !rightBlink || !orbitBlink) return

    let isMounted = true

    const scheduleNextBlink = (delay?: number) => {
      if (!isMounted) return
      if (blinkTimerRef.current !== null) {
        window.clearTimeout(blinkTimerRef.current)
      }

      // 自然随机间隔：3～7 秒
      const nextDelay = delay ?? 3000 + Math.random() * 4000

      blinkTimerRef.current = window.setTimeout(() => {
        if (!isMounted) return

        // 如果页面隐藏在后台或不可见，暂停本次触发，等待 visibilitychange 唤醒
        if (typeof document !== 'undefined' && document.hidden) {
          return
        }

        playBlink()
        scheduleNextBlink()
      }, nextDelay)
    }

    // 监听页面可见性：后台暂停，恢复时重新安排自然眨眼
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (blinkTimerRef.current !== null) {
          window.clearTimeout(blinkTimerRef.current)
          blinkTimerRef.current = null
        }
      } else {
        // 页面重新可见：等待 1.5～3 秒后安排下一次眨眼
        scheduleNextBlink(1500 + Math.random() * 1500)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // 初次加载：2～3.5 秒后进行第一次眨眼
    scheduleNextBlink(2000 + Math.random() * 1500)

    return () => {
      isMounted = false
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (blinkTimerRef.current !== null) {
        window.clearTimeout(blinkTimerRef.current)
        blinkTimerRef.current = null
      }
      if (blinkEndTimerRef.current !== null) {
        window.clearTimeout(blinkEndTimerRef.current)
        blinkEndTimerRef.current = null
      }
    }
  }, [actions, playBlink])

  // 4. Speaking animation control:
  // 严格在 isActuallySpeaking (即 status === 'speaking') 时循环播放 GLB「张嘴」动画；
  // 说话结束时淡出并在 useFrame 中阻尼复位为 0
  useEffect(() => {
    const speakAction = actions['张嘴'] || actions['眨眼动作.003']
    if (isActuallySpeaking) {
      if (speakAction) {
        speakAction.reset()
        speakAction.setLoop(THREE.LoopRepeat, Infinity)
        speakAction.fadeIn(0.12).play()
      }
    } else {
      if (speakAction) {
        speakAction.fadeOut(0.18)
      }
      if (mouthMeshRef.current?.morphTargetInfluences && mouthMeshRef.current.morphTargetDictionary) {
        const idx =
          mouthMeshRef.current.morphTargetDictionary['嘴巴'] ??
          mouthMeshRef.current.morphTargetDictionary['mouth_open']
        if (idx !== undefined) {
          mouthMeshRef.current.morphTargetInfluences[idx] = 0
        }
      }
    }
  }, [isActuallySpeaking, actions])

  // Handle click / tap on Xiaoan (trigger a cute wave!)
  const handlePointerDown = () => {
    if (isLocked) return
    if (onClick) onClick()
    if (isWavingRef.current) return

    const waveAction = actions['wave']
    const idleAction = actions['Idle']
    if (waveAction) {
      isWavingRef.current = true
      waveAction.reset()
      waveAction.setLoop(THREE.LoopOnce, 1)
      waveAction.clampWhenFinished = false
      waveAction.fadeIn(0.2).play()

      const duration = waveAction.getClip().duration || 1.6
      window.setTimeout(() => {
        waveAction.fadeOut(0.3)
        if (!isLocked) {
          idleAction?.fadeIn(0.3)
        }
        isWavingRef.current = false
      }, duration * 1000)
    }
  }

  // Frame update: Pose handling and animation damping
  useFrame((state, delta) => {
    if (!groupRef.current) return

    // Fallback speaking mouth animation only if action is absent
    const hasSpeakClip = !!(actions['张嘴'] || actions['眨眼动作.003'])
    const mouthIdx = mouthMeshRef.current?.morphTargetDictionary
      ? (mouthMeshRef.current.morphTargetDictionary['嘴巴'] ??
        mouthMeshRef.current.morphTargetDictionary['mouth_open'])
      : undefined

    if (
      isActuallySpeaking &&
      !hasSpeakClip &&
      mouthMeshRef.current?.morphTargetInfluences &&
      mouthIdx !== undefined
    ) {
      const openVal = Math.sin(state.clock.elapsedTime * 14) * 0.4 + 0.4
      mouthMeshRef.current.morphTargetInfluences[mouthIdx] = THREE.MathUtils.lerp(
        mouthMeshRef.current.morphTargetInfluences[mouthIdx],
        openVal,
        0.3
      )
    }

    // When NOT speaking, ensure any residual mouth weight smoothly returns to 0 (completely closed)
    if (
      !isActuallySpeaking &&
      mouthMeshRef.current?.morphTargetInfluences &&
      mouthIdx !== undefined &&
      mouthMeshRef.current.morphTargetInfluences[mouthIdx] > 0.001
    ) {
      mouthMeshRef.current.morphTargetInfluences[mouthIdx] = THREE.MathUtils.damp(
        mouthMeshRef.current.morphTargetInfluences[mouthIdx],
        0,
        10,
        delta
      )
    }

    // When NOT currently blinking, ensure any residual eye/orbit morph weights smoothly return to 0 (open eyes)
    if (!isBlinkingRef.current && eyeMeshesRef.current.length > 0) {
      eyeMeshesRef.current.forEach((mesh) => {
        if (mesh.morphTargetInfluences) {
          for (let i = 0; i < mesh.morphTargetInfluences.length; i++) {
            if (mesh.morphTargetInfluences[i] > 0.001) {
              mesh.morphTargetInfluences[i] = THREE.MathUtils.damp(
                mesh.morphTargetInfluences[i],
                0,
                12,
                delta
              )
            }
          }
        }
      })
    }

    // 姿态控制与锁定逻辑：
    // 若处于 turningToFront 或 speaking 状态：严格锁定姿态，平滑回归正面（rotation = 0, position = 0），
    // 禁止任何鼠标跟随、头部注视和拖拽偏移！
    if (isLocked) {
      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        0,
        9.0,
        delta
      )
      groupRef.current.rotation.x = THREE.MathUtils.damp(
        groupRef.current.rotation.x,
        0,
        9.0,
        delta
      )
      groupRef.current.position.x = THREE.MathUtils.damp(
        groupRef.current.position.x,
        0,
        9.0,
        delta
      )
      return
    }

    if (!interactive) return

    // 正常待机互动状态：平滑响应鼠标光标
    const pointer = state.pointer
    // 1. Gentle horizontal translation: shift slightly left/right towards pointer
    const targetX = pointer.x * 0.05
    groupRef.current.position.x = THREE.MathUtils.damp(
      groupRef.current.position.x,
      targetX,
      3.5,
      delta
    )

    // 2. Gentle head/body turn: smooth, modest rotation (max ~12° yaw, ~6° pitch)
    const targetRotY = pointer.x * 0.22
    const targetRotX = -pointer.y * 0.10
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      targetRotY,
      3.8,
      delta
    )
    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      targetRotX,
      3.8,
      delta
    )
  })

  return (
    <group
      ref={groupRef}
      onPointerDown={handlePointerDown}
      // Position model centered vertically: bounding box y is ~[0.07, 0.93], center is at y ~0.50
      position={[0, -0.48, 0]}
    >
      <primitive ref={modelRef} object={clonedScene} />
    </group>
  )
}

// Loading placeholder with soft glowing outline
function XiaoanLoadingPlaceholder() {
  return (
    <div className="xiaoan-3d-loading" aria-hidden="true">
      <div className="xiaoan-3d-spinner" />
    </div>
  )
}

// Error Boundary for WebGL/3D failure
class XiaoanErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.warn('[Xiaoan3D] WebGL rendering error fallback to 2D:', error)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

export function Xiaoan3D({
  size = 'large',
  isSpeaking = false,
  status = 'idle',
  interactive = true,
  className = '',
  onClick,
}: Xiaoan3DProps) {
  const [loadError, setLoadError] = useState(false)
  const orbitRef = useRef<any>(null)

  // Camera settings: distance calibrated for aspect ratios
  const cameraZ = size === 'small' ? 1.95 : 1.88

  const isLocked = status === 'turningToFront' || status === 'speaking'

  // 当进入转向或说话锁定状态时，重置可能被拖动过的摄像机控制器回正中央
  useEffect(() => {
    if (isLocked && orbitRef.current) {
      orbitRef.current.reset()
    }
  }, [isLocked])

  if (loadError) {
    return (
      <div className={`xiaoan-3d-fallback ${className}`}>
        <img src={mascotFallback} alt="小安" />
      </div>
    )
  }

  return (
    <XiaoanErrorBoundary
      fallback={
        <div className={`xiaoan-3d-fallback ${className}`}>
          <img src={mascotFallback} alt="小安" />
        </div>
      }
    >
      <div className={`xiaoan-3d-wrapper size-${size} ${className}`}>
        <Suspense fallback={<XiaoanLoadingPlaceholder />}>
          <Canvas
            gl={{
              alpha: true,
              antialias: true,
              powerPreference: 'high-performance',
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.08,
            }}
            camera={{
              position: [0, 0, cameraZ],
              fov: 34,
              near: 0.1,
              far: 20,
            }}
            style={{
              width: '100%',
              height: '100%',
              pointerEvents: 'auto',
              background: 'transparent',
            }}
            dpr={[1, 2]}
            onError={() => setLoadError(true)}
          >
            {/* 柔和、明亮、自然的心理疗愈多层次光照体系 */}
            {/* 1. 半球环境光：天空纯白，地面草绿漫反射 */}
            <hemisphereLight args={['#ffffff', '#b4dcbe', 1.05]} />

            {/* 2. 温润全局漫反射光 */}
            <ambientLight intensity={0.9} color="#fffef2" />

            {/* 3. 正面主光（阳光暖调）：温暖照亮脸部五官 */}
            <directionalLight
              position={[0.8, 2.6, 3.2]}
              intensity={1.45}
              color="#fffaf0"
            />

            {/* 4. 左侧薄荷绿侧光：柔和提亮侧面暗处 */}
            <directionalLight
              position={[-2.8, 1.2, 2.0]}
              intensity={0.75}
              color="#e6f7ec"
            />

            {/* 5. 顶部背面轮廓光：细腻勾勒耳朵轮廓 */}
            <directionalLight
              position={[0, 3.2, -2.8]}
              intensity={0.55}
              color="#ffffff"
            />

            <XiaoanModel
              isSpeaking={isSpeaking}
              status={status}
              interactive={interactive}
              onClick={onClick}
            />

            {/* 拖拽旋转：在转向正面与讲话锁定期间严格禁用（enabled={!isLocked}），平时限制旋转安全角度 */}
            <OrbitControls
              ref={orbitRef}
              enabled={!isLocked && interactive}
              enableZoom={false}
              enablePan={false}
              rotateSpeed={0.6}
              minAzimuthAngle={-Math.PI / 4.5}
              maxAzimuthAngle={Math.PI / 4.5}
              minPolarAngle={Math.PI / 2 - 0.2}
              maxPolarAngle={Math.PI / 2 + 0.2}
            />
          </Canvas>
        </Suspense>
      </div>
    </XiaoanErrorBoundary>
  )
}

// Preload the GLB model in background
useGLTF.preload(MODEL_PATH)

export default Xiaoan3D
