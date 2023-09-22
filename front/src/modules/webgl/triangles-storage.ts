import * as THREE from 'three';
import type {Triangle as MathTriangle} from "../../models/triangle";
import {Point} from "../../models/point";

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
        const material = new THREE.MeshStandardMaterial({color: THREE.Color.NAMES.grey, side: THREE.DoubleSide});
        geometry.computeVertexNormals();

        super(geometry, material);

        if (points) {
            this.setPoints(points);
        }
    }

    setPoints(points: [THREE.Vector3, THREE.Vector3, THREE.Vector3]) {
        const verticesElements = this.reducePointsToArray(points);
        const vertices1 = new Float32Array(verticesElements);
        this.geometry.setAttribute('position', new THREE.BufferAttribute(vertices1, 3));
        this.geometry.computeVertexNormals();
    }

    setNormal(normal: THREE.Vector3) {
        this.geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array([
            normal.x, normal.y, normal.z
        ]), 1));
        this.geometry.computeVertexNormals();
    }

    private reducePointsToArray(points: Point[]) {
        return points.reduce((acc: number[], cur) => {
            acc.push(cur.x, cur.y, cur.z);
            return acc
        }, [])
    }
}


const storage = new TrianglesStorage();
export default storage;
