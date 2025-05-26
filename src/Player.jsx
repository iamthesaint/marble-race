import { RigidBody, useRapier } from '@react-three/rapier'
import { useFrame, useLoader } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import useGame from './stores/useGame.jsx'

const texture = new THREE.TextureLoader().load('/lightgold_preview.png')
texture.colorSpace = THREE.SRGBColorSpace
export default function Player()
{
    // controls
    const body = useRef()
    const [ subscribeKeys, getKeys ] = useKeyboardControls()
    const { rapier, world } = useRapier()
    // the 10s are the initial values for the camera position and target to start the camera further away`
    const [ smoothedCameraPosition ] = useState(() => new THREE.Vector3(10, 10, 10))
    const [ smoothedCameraTarget ] = useState(() => new THREE.Vector3())

    const start = useGame((state) => state.start)
    const end = useGame((state) => state.end)
    const restart = useGame((state) => state.restart)
    const blocksCount = useGame((state) => state.blocksCount)

    const jump = () =>
    {
        // console.log('jump')
        const origin = body.current.translation()
        origin.y -= 0.31
        const direction = { x: 0, y: -1, z: 0 }
        const ray = new rapier.Ray(origin, direction)
        // true to enable the closest hit feature (everything will be considered solid)
        const hit = world.castRay(ray, 10, true)

        if(hit.timeOfImpact < 0.15)
        body.current.applyImpulse({ x: 0, y: 0.5, z: 0 })
    }

    const reset = () =>
    {
        body.current.setTranslation({ x: 0, y: 1, z: 0 })
        body.current.setLinvel({ x: 0, y: 0, z: 0 })
        body.current.setAngvel({ x: 0, y: 0, z: 0 })
    }
 
    useEffect(() =>
    {
        const unsubscribeReset = useGame.subscribe(
            (state) => state.phase,
            (value) => 
                {
                    if(value === 'ready')
                        reset()
                },
        )

        // subscribe to the jump key and call the jump function when the key is pressed
        const unsubscribeJump = subscribeKeys(
            // selector for the jump key
            (state) => state.jump,
            (value) => 
            {
                if(value)
                    jump()
            }
            )

            const unsubscribeAny = subscribeKeys(
                () =>
                {
                    start()
                }
            )

            // unsubscribe to avoid memory leaks when the component is unmounted
            return () =>
            {
                unsubscribeReset()
                unsubscribeJump()
                unsubscribeAny()
            }
    }, [])

    // use useFrame so the player can move and it will be updated every frame
    useFrame((state, delta) =>
    {
        const { forward, backward, leftward, rightward } = getKeys()

        const impulse = { x: 0, y: 0, z: 0 }
        const torque = { x: 0, y: 0, z: 0 }

        const impulseStrength = 1 * delta
        const torqueStrength = 1 * delta

        if(forward)
        {
            impulse.z -= impulseStrength
            torque.x -= torqueStrength
        }

        if(rightward)
        {
            impulse.x += impulseStrength
            torque.z -= torqueStrength}

        if(backward)
        {
            impulse.z += impulseStrength
            torque.x += torqueStrength
        }

        if(leftward)
        {
            impulse.x -= impulseStrength
            torque.z += torqueStrength
        }

        body.current.applyImpulse(impulse)
        body.current.applyTorqueImpulse(torque)
    
        // camera

        const bodyPosition = body.current.translation()

        const cameraPosition = new THREE.Vector3()
        cameraPosition.copy(bodyPosition)
        cameraPosition.z += 2.25
        cameraPosition.y += 0.65

        const cameraTarget = new THREE.Vector3()
        cameraTarget.copy(bodyPosition)
        cameraTarget.y += 0.25

        smoothedCameraPosition.lerp(cameraPosition, 5 * delta)
        smoothedCameraTarget.lerp(cameraTarget, 5 * delta)

        state.camera.position.copy(smoothedCameraPosition)
        state.camera.lookAt(smoothedCameraTarget)

        // phases
        if(bodyPosition.z < - (blocksCount * 4 + 2))
            end()

        if(bodyPosition.y < - 4)
            restart()

        })

    return <RigidBody
    ref={ body } 
    canSleep={ false } 
    colliders="ball" 
    restitution={ 0.2 } 
    position={ [ 0, 1, 0 ] }
    friction={ 1 }
    linearDamping={ 0.5 }
    angularDamping={ 0.5 }
    >
        <mesh castShadow>
            <icosahedronGeometry args={ [ 0.3, 1 ] } />
            <meshPhysicalMaterial
                map={ texture }
                toneMapped={ false }
                
                />
        </mesh>
    </RigidBody>

} 