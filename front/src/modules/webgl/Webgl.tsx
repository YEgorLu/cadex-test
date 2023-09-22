import {FC, useEffect, useRef} from "react";
import * as THREE from "three";
import {Triangle as MathTriangle} from "../../models/triangle";
import style from './Webgl.module.scss';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import trianglesStorage, {Triangle} from "./triangles-storage";

export interface WebGLProps {
    triangles: MathTriangle[];
    height: number;
    radius: number;
    useSmoothing: boolean;
}

const WebGL: FC<WebGLProps> = ({triangles, radius, height, useSmoothing}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sceneRef = useRef(new THREE.Scene());
    const cameraRef = useRef(new THREE.PerspectiveCamera());
    const rendererRef = useRef<THREE.WebGLRenderer>();
    const controllers = useRef<{ update: () => void }[]>([]);
    const usedTriangles = useRef<Triangle[]>([]);
    const lightRef = useRef(new THREE.RectAreaLight(THREE.Color.NAMES.white, 2, 100, 100))
    const lightRef2 = useRef(new THREE.RectAreaLight(THREE.Color.NAMES.white, 2, 100, 100))
    const lightRef3 = useRef(new THREE.RectAreaLight(THREE.Color.NAMES.white, 2, 100, 100))
    const lightRef4 = useRef(new THREE.RectAreaLight(THREE.Color.NAMES.white, 2, 100, 100))
    const bottomLight = useRef(new THREE.DirectionalLight(THREE.Color.NAMES.white, 2))

    useEffect(() => {
        if (!canvasRef.current) return;
        console.log('got canvas');

        const width = canvasRef.current.offsetWidth;
        const height = canvasRef.current.offsetHeight;

        const camera = cameraRef.current
        configureCamera(camera, width, height);


        const renderer = new THREE.WebGLRenderer({canvas: canvasRef.current});
        rendererRef.current = renderer;
        renderer.setSize(width, height);

        sceneRef.current.add(lightRef.current);
        sceneRef.current.add(lightRef2.current);
        sceneRef.current.add(lightRef3.current);
        sceneRef.current.add(lightRef4.current);
        bottomLight.current.position.set(0,-10,0);
        sceneRef.current.add(bottomLight.current);

        const orbitControls = new OrbitControls(camera, renderer.domElement);
        if (!controllers.current.length)
        controllers.current.push(orbitControls);

        const render = () => {
            requestAnimationFrame(render);
            renderer.render(sceneRef.current, camera);
            orbitControls.update();
        };

        const resizeHandler = () => {
            const width = canvasRef.current!.offsetWidth;
            const height = canvasRef.current!.offsetHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            render()
        }
        canvasRef.current!.addEventListener('resize', resizeHandler);
        render();

        return () => {
            renderer.dispose();
            orbitControls.dispose();
        };
    }, [canvasRef.current]);

    useEffect(() => {
        setTimeout(() => {
            const renderer = rendererRef.current;
            const scene = sceneRef.current;
            const camera = cameraRef.current;

            if ([renderer, scene, camera].some(v => !v)) return;

            if (usedTriangles.current) trianglesStorage.returnItems(...usedTriangles.current);
            const _triangles = trianglesStorage.getItems(triangles.length * 2);
            setTopTriangles(_triangles, triangles, useSmoothing);
            setBottomTriangles(_triangles, triangles);

            scene.add(..._triangles);
            usedTriangles.current = _triangles;
            scene.background = new THREE.Color(THREE.Color.NAMES.blue);

            render(renderer!, scene, camera, controllers.current);
            return () => {
                trianglesStorage.returnItems(..._triangles);
            }
        }, 1000);
    }, [rendererRef.current, sceneRef.current, cameraRef.current, controllers.current, triangles, useSmoothing])

    useEffect(() => {
        const light = lightRef.current;
        const light2 = lightRef2.current;
        const light3 = lightRef3.current;
        const light4 = lightRef4.current;

        light.position.set(radius * 2, height / 2, radius *2);
        light2.position.set(-radius*2, height/2, -radius*2);
        light3.position.set(-radius*2, height/2, radius * 2);
        light4.position.set(radius*2, height/2, -radius * 2);

        [light, light2, light3, light4].forEach(l => {
            l.lookAt(0, height / 2, 0);
            l.width = radius * 2;
            l.height = height;
            l.updateMatrix();
        });
    }, [height, radius])

    return (
        <div>
            <canvas id={style['canvas']} ref={canvasRef}/>
        </div>
    );
}

export default WebGL;

const setTopTriangles = (objTriangles: Triangle[], mathTriangles: MathTriangle[], useSmoothing: boolean) => {
    for (let i = 0; i < mathTriangles.length; i++) {
        const objTriangle = objTriangles[i];
        const mathTriangle = mathTriangles[i];
        const points = mathTriangle.points
            .map(point => new THREE.Vector3(point.x, point.y, point.z)) as [THREE.Vector3, THREE.Vector3, THREE.Vector3]
        const normal = new THREE.Vector3(mathTriangle.normal.x, mathTriangle.normal.y, mathTriangle.normal.z);

        objTriangle.setPoints(points);
        if (useSmoothing) objTriangle.setNormal(normal);
    }
}

const setBottomTriangles = (objTriangles: Triangle[], mathTriangles: MathTriangle[]) => {
    for (let i = 0; i < mathTriangles.length; i++) {
        const objTriangle = objTriangles[i + mathTriangles.length];
        const mathTriangle = mathTriangles[i];
        const points = mathTriangle.points
            .map(point => new THREE.Vector3(point.x, 0, point.z)) as [THREE.Vector3, THREE.Vector3, THREE.Vector3]

        objTriangle
            .setPoints(points);
    }
}

/*const setLights = (scene: THREE.Scene) => {
    const width = 10;
    const height = 10;
    const intensity = 10;
    const rectLight = new THREE.RectAreaLight( 0xffffff, intensity,  width, height );
    rectLight.position.set( 50, 50, 0 );
    rectLight.lookAt( 0, 0, 0 );
    scene.add( rectLight )

    /!*scene.add(light1, light2, light3, light4);*!/
    //scene.add(light);
}*/

const configureCamera = (camera: THREE.PerspectiveCamera, width: number, height: number) => {
    camera.fov = 25;
    camera.aspect = width / height;
    camera.near = .1;
    camera.far = 1000;
    camera.position.z = 50;
}

const render = (renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, controllers: { update: () => void }[]) => {
    requestAnimationFrame(() => {
        console.log({renderer, scene, camera, controllers});
        renderer.render(scene, camera);
        controllers.forEach(controller => controller.update());
    });
}
