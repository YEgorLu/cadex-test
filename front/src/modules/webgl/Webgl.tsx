import {FC, useEffect, useRef} from "react";
import * as THREE from "three";
import {Triangle} from "../../models/triangle";
import style from './Webgl.module.scss';
import {ArcballControls} from "three/examples/jsm/controls/ArcballControls";
import TrianglesStorage from './triangles-storage';

export interface WebGLProps {
    triangles: Triangle[];
}

const WebGL: FC<WebGLProps> = ({triangles}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sceneRef = useRef(new THREE.Scene());
    const cameraRef = useRef(new THREE.PerspectiveCamera());
    const rendererRef = useRef<THREE.WebGLRenderer>();
    const controllers = useRef<{update: () => void}[]>([]);

    useEffect(() => {
        if (!canvasRef.current) return;
        console.log('got canvas');

        const width = canvasRef.current.offsetWidth;
        const height = canvasRef.current.offsetHeight;

        // Create camera
        const camera = cameraRef.current;
        camera.fov = 75;
        camera.aspect = width / height;
        camera.near = .1;
        camera.far = 1000;
        camera.position.z = 50;

        // Create renderer
        const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
        rendererRef.current = renderer;
        renderer.setSize(width, height);

        // Create sphere
        /*const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshStandardMaterial({ color: 'red' });
        const sphere = new THREE.Mesh(geometry, material);
*/
        /*const light = new THREE.DirectionalLight(0x404040, 0.8);
        light.position.set(3,3,3);*/
        const light = new THREE.AmbientLight(THREE.Color.NAMES.white);

        sceneRef.current.add(light);

        // Create ArcBallController
        const arcBallController = new ArcballControls(camera, renderer.domElement);
        controllers.current.push(arcBallController);
        arcBallController.cursorZoom = true;

        const render = () => {
            requestAnimationFrame(render);
            renderer.render(sceneRef.current, camera);
            arcBallController.update();
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
            arcBallController.dispose();
        };
    }, [canvasRef.current]);

    useEffect(() => {
        setTimeout(() => {
        const renderer = rendererRef.current;
        const scene = sceneRef.current;
        const camera = cameraRef.current;
        console.log('gettings');
        console.log({renderer, scene, camera});
        console.log([renderer, scene, camera].some(v => !v));
        if ([renderer, scene, camera].some(v => !v)) return;
        setTimeout(() => console.log(camera), 1000);
        const [triangle] = TrianglesStorage.getItems(1);
        triangle.setPoints([
            new THREE.Vector3(5, -0.75, 1),
            new THREE.Vector3(5, 0.25, 1,),
            new THREE.Vector3(0, 0, 1),
        ]);

            //const sphere = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshStandardMaterial({color: THREE.Color.NAMES.white, side: THREE.DoubleSide}))

        scene.add(triangle);
            scene.background = new THREE.Color(THREE.Color.NAMES.blue);
        console.log('triangle added');
        render(renderer!, scene, camera, controllers.current);
        }, 1000);
    }, [rendererRef.current, sceneRef.current, cameraRef.current, controllers.current])

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
