import * as THREE from 'three';
import {ShapeGeometry} from "three";

export class TrianglesStorage {
    private items: Triangle[] = [];

    constructor(initCount = 10) {
        for (let i = 0; i < initCount; i++) {
            this.items.push(new Triangle());
        }
    }

    getItems(count: number = 1): Triangle[] {
        if (count <= 0) return [];
        while (this.items.length < count) this.items.push(new Triangle());
        const res: Triangle[] = [];
        for (let i = 0; i < count; i++) {
            res.push(this.items.pop() as Triangle);
        }
        return res;
    }

    returnItems(...items: Triangle[]) {
        items.forEach(item => item.parent && item.removeFromParent());
        this.items.concat(...items);
    }
}

export class Triangle extends THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial> {
    constructor(points?: [THREE.Vector3, THREE.Vector3, THREE.Vector3]) {
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.MeshStandardMaterial({color: THREE.Color.NAMES.white, side: THREE.DoubleSide});

        super(geometry, material);

        if (points) {
            this.setPoints(points);
        }
    }

    setPoints(points: [THREE.Vector3, THREE.Vector3, THREE.Vector3]) {
        const verticesElements = points.reduce((acc: number[], cur) => {
            acc.push(cur.x, cur.y, cur.z);
            return acc
        }, [])
        const vertices1 = new Float32Array(verticesElements);
        this.geometry.setAttribute('position', new THREE.BufferAttribute(vertices1, 3));
        this.geometry.computeVertexNormals();
    }
}


const storage = new TrianglesStorage();
export default storage;
