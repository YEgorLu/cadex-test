import {FC, useEffect, useRef} from "react";
import * as THREE from "three";
import {Triangle as MathTriangle} from "../../models/triangle";
import style from './Webgl.module.scss';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import trianglesStorage, {Triangle} from "./triangles-storage";

export interface WebGLProps {
    triangles: MathTriangle[];
}

const WebGL: FC<WebGLProps> = ({triangles}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sceneRef = useRef(new THREE.Scene());
    const cameraRef = useRef(new THREE.PerspectiveCamera());
    const rendererRef = useRef<THREE.WebGLRenderer>();
    const controllers = useRef<{update: () => void}[]>([]);
    const usedTriangles = useRef<Triangle[]>([]);

    useEffect(() => {
        if (!canvasRef.current) return;
        console.log('got canvas');

        const width = canvasRef.current.offsetWidth;
        const height = canvasRef.current.offsetHeight;

        const camera = cameraRef.current;
        camera.fov = 25;
        camera.aspect = width / height;
        camera.near = .1;
        camera.far = 1000;
        camera.position.z = 50;


        const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
        rendererRef.current = renderer;
        renderer.setSize(width, height);

        const light = new THREE.DirectionalLight(THREE.Color.NAMES.white, 1);
        const ambient = new THREE.DirectionalLight(THREE.Color.NAMES.white, 1);
        light.position.x = 50;
        light.position.y = 50;
        light.position.z = 50;
        ambient.position.x = -50;
        ambient.position.y = -50;
        ambient.position.z = -50;
        sceneRef.current.add(light, ambient);


        const orbitControls = new OrbitControls(camera, renderer.domElement);
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

        // Clean up
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
        for (let i = 0; i < triangles.length; i++) {
            const objTriangle = _triangles[i];
            const mathTriangle = triangles[i];
            const points = mathTriangle
                .map(point => new THREE.Vector3(point.x, point.y, point.z))as [THREE.Vector3, THREE.Vector3, THREE.Vector3]

            objTriangle
                .setPoints(points);
        }

        for (let i = 0; i < triangles.length; i++) {
            const objTriangle = _triangles[i + triangles.length];
            const mathTriangle = triangles[i];
            const points = mathTriangle
                .map(point => new THREE.Vector3(point.x, 0, point.z))as [THREE.Vector3, THREE.Vector3, THREE.Vector3]

            objTriangle
                .setPoints(points);
        }

        scene.add(..._triangles);
        usedTriangles.current = _triangles;
            scene.background = new THREE.Color(THREE.Color.NAMES.blue);
        console.log('triangle added');
        render(renderer!, scene, camera, controllers.current);
        return () => {
            console.log('returning triangles');
            trianglesStorage.returnItems(..._triangles);
        }
        }, 1000);
    }, [rendererRef.current, sceneRef.current, cameraRef.current, controllers.current, triangles])

    return (
        <div>
            <canvas id={style['canvas']} ref={canvasRef}/>
        </div>
    );
}

export default WebGL;

const render = (renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, controllers: {update: () => void}[]) => {
    requestAnimationFrame(() => {
        console.log({renderer, scene, camera, controllers});
        renderer.render(scene, camera);
        controllers.forEach(controller => controller.update());
    });
}
