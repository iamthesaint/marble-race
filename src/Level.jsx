import * as THREE from 'three'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, Float, Text } from '@react-three/drei'

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)

const floor1Material = new THREE.MeshStandardMaterial({ color: 'lightseagreen' })
const floor2Material = new THREE.MeshStandardMaterial({ color: 'ghostwhite' })
const obstacleMaterial = new THREE. MeshStandardMaterial({ color: 'cornflowerblue' })
const wallMaterial = new THREE.MeshStandardMaterial({ color: 'grey' })

export function BlockStart({ position = [ 0, 0, 0 ] })
{
    return <group position={ position }>
        <Float floatIntensity={ 0.25 } rotationIntensity={ 0.25 }>
            <Text 
            font="/bebas-neue-v9-latin-regular.woff"
            scale={ 0.5 }
            maxWidth={ 0.25 }
            lineHeight={ 0.75 }
            textAlign="right"
            position={ [ 0.75, 0.65, 0 ] }
            rotation-y={ -0.25 }
            >
                START
                <meshBasicMaterial toneMapped={ false } />
            </Text>
        </Float>
        {/* floor */}
        <mesh geometry={ boxGeometry } material={ floor1Material } position={ [ 0, -0.1, 0 ] } scale={ [ 4, 0.2, 4 ] }receiveShadow />

    </group>
}

export function BlockSpinner({ position = [ 0, 0, 0 ] })
{
    const obstacle = useRef()
    const [ speed ] = useState(() => (Math.random() + 0.2) * (Math.random() < 0.5 ? -1 : 1))

    // set rotation to obstacle
    useFrame((state) =>
    {
        const time = state.clock.getElapsedTime()

        const rotation = new THREE.Quaternion()
        rotation.setFromEuler(new THREE.Euler(0, time * speed, 0))
        obstacle.current.setNextKinematicRotation(rotation)

    })
    return <group position={ position }>

        {/* floor */}
        <mesh geometry={ boxGeometry } material={ floor2Material } position={ [ 0, -0.1, 0 ] } scale={ [ 4, 0.2, 4 ] }receiveShadow />

        {/* obstacle */}
        <RigidBody ref={ obstacle } type="kinematicPosition" position={ [ 0, 0.3, 0 ] } restitution={ 0.2 } friction={ 0 }>
            <mesh geometry= { boxGeometry } material={ obstacleMaterial } scale={ [ 3.5, 0.3, 0.3 ] } castShadow receiveShadow />
        </RigidBody>

    </group>
}

export function BlockLimbo({ position = [ 0, 0, 0 ] })
{
    const obstacle = useRef()
    // random offset to make the obstacle move in a different way than the spinner obstacle
    const [ timeOffset ] = useState(() => Math.random() * Math.PI * 2)

    // set rotation to obstacle
    useFrame((state) =>
    {
        const time = state.clock.getElapsedTime()

        const y = Math.sin(time + timeOffset) + 1.15
        obstacle.current.setNextKinematicTranslation({ x: position[0], y: position[1] + y, z: position[2] })

    })
    return <group position={ position }>

        {/* floor */}
        <mesh geometry={ boxGeometry } material={ floor2Material } position={ [ 0, -0.1, 0 ] } scale={ [ 4, 0.2, 4 ] }receiveShadow />

        {/* obstacle */}
        <RigidBody ref={ obstacle } type="kinematicPosition" position={ [ 0, 0.3, 0 ] } restitution={ 0.2 } friction={ 0 }>
            <mesh geometry= { boxGeometry } material={ obstacleMaterial } scale={ [ 3.5, 0.3, 0.3 ] } castShadow receiveShadow />
        </RigidBody>

    </group>
}

export function BlockAxe({ position = [ 0, 0, 0 ] })
{
    const obstacle = useRef()
    // random offset to make the obstacle move in a different way than the spinner obstacle
    const [ timeOffset ] = useState(() => Math.random() * Math.PI * 2)

    // set rotation to obstacle
    useFrame((state) =>
    {
        const time = state.clock.getElapsedTime()

        const x = Math.sin(time + timeOffset) * 1.25
        obstacle.current.setNextKinematicTranslation({ x: position[0] + x, y: position[1] + 0.75, z: position[2] })

    })
    return <group position={ position }>

        {/* floor */}
        <mesh geometry={ boxGeometry } material={ floor2Material } position={ [ 0, -0.1, 0 ] } scale={ [ 4, 0.2, 4 ] }receiveShadow />

        {/* obstacle */}
        <RigidBody ref={ obstacle } type="kinematicPosition" position={ [ 0, 0.3, 0 ] } restitution={ 0.2 } friction={ 0 }>
            <mesh geometry= { boxGeometry } material={ obstacleMaterial } scale={ [ 1.5, 1.5, 0.3 ] } castShadow receiveShadow />
        </RigidBody>

    </group>
}

export function BlockEnd({ position = [ 0, 0, 0 ] })
{

    const cat = useGLTF('./cat.glb')

    cat.scene.children.forEach((mesh) =>
        {
            mesh.castShadow = true
        })

    return <group position={ position }>
        <Text font="/bebas-neue-v9-latin-regular.woff" scale={ 1 } position={ [ 0, 2.25, 2 ] } >
            FINISH
            <meshBasicMaterial toneMapped={ false } />
        </Text>

        {/* floor */}
        <mesh geometry={ boxGeometry } material={ floor1Material } position={ [ 0, 0, 0 ] } scale={ [ 4, 0.2, 4 ] }receiveShadow />
        <RigidBody type="fixed" colliders="hull" position={ [ 0, 0.25, 0 ] }restitution={ 0.2 } friction={ 0 }>
            <primitive object={ cat.scene } scale={ 0.01 } />
        </RigidBody>

    </group>
}

// walls to keep the player inside the level
function Bounds({ length = 1 })
{
    return <>
    <RigidBody type="fixed" restitution={ 0.2 } friction={ 1 }>
    {/* right wall */}
    <mesh
    position={ [ 2.15, 0.75, - (length * 2) + 2 ] }
    geometry={ boxGeometry }
    material={ wallMaterial }
    scale={ [ 0.3, 1.5, 4 * length ] }
    castShadow
    />
    {/* left wall */}
    <mesh
    position={ [ -2.15, 0.75, - (length * 2) + 2 ] }
    geometry={ boxGeometry }
    material={ wallMaterial }
    scale={ [ 0.3, 1.5, 4 * length ] }
    receiveShadow
    />
    {/* back wall */}
    <mesh
    position={ [ 0, 0.75, - (length * 4) + 2 ] }
    geometry={ boxGeometry }
    material={ wallMaterial }
    scale={ [ 4, 1.5, 0.3 ] }
    receiveShadow
    />
    {/* floor */}
    <CuboidCollider
    args={ [ 2, 0.1, 2 * length ] }
    position={ [ 0, -0.1, - (length * 2) + 2 ] }
    restitution={ 0.2 }
    // without friction the ball will only slide
    friction={ 1 }
    />
    </RigidBody>
    </>
}

// make count and types available as props
export function Level({ count = 5, types = [ BlockSpinner, BlockAxe, BlockLimbo ], seed = 0 })
{
    const blocks = useMemo(() =>
    {
        const blocks = []

        for (let i = 0; i < count; i++)
        {
            const type = types[ Math.floor(Math.random() * types.length) ]
            blocks.push(type)
        }

        return blocks
    }, [ count, types, seed ])

    return <>

        <BlockStart position={ [ 0, 0, 0 ] } />
                                        {/* negative index will create the illusion of starting at the beginning */}
        { blocks.map((Block, index) => <Block key={ index } position={ [ 0, 0, - (index + 1) * 4 ] } />) }

        <BlockEnd position={ [ 0, 0, -(count + 1) * 4 ] } />

        <Bounds length={ count + 2 } />

    </>
}