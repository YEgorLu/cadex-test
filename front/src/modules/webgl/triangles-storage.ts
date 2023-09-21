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
        return (this.items.splice(this.items.length - 1 - count, count));
    }

    returnItems(...items: Triangle[]) {
        items.forEach(item => item.parent && item.removeFromParent());
        this.items.concat(...items);
    }
}

export class Triangle extends THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial> {
    private shape = new THREE.Shape();
    private mathTriangle: THREE.Triangle = new THREE.Triangle();

    constructor(points?: [THREE.Vector3, THREE.Vector3, THREE.Vector3]) {
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.MeshStandardMaterial({color: THREE.Color.NAMES.white, side: THREE.DoubleSide});
        super(geometry, material);

        if (points) {
            this.setPoints(points);
        }
    }

    setPoints(points: [THREE.Vector3, THREE.Vector3, THREE.Vector3]) {
        /*this.mathTriangle.set(...points);
        const tr = this.mathTriangle;
        if (!this.geometry.attributes.position) {
            this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
                tr.a.x, tr.a.y, tr.a.z,
                tr.b.x, tr.b.y, tr.b.z,
                tr.c.x, tr.c.y, tr.c.z,
            ]), 3));
        } else {
            const {a, b, c} = this.mathTriangle;
            [a, b, c].forEach((point, i) => {
                this.geometry.attributes.position.setXYZ(i, point.x, point.y, point.z);
            });
        }
        this.geometry.computeBoundingBox();
        this.geometry.attributes.position.needsUpdate = true;*/

        const verticesElements = points.reduce((acc: number[], cur) => {acc.push(cur.x, cur.y, cur.z); return acc}, [])
        const vertices1 = new Float32Array(verticesElements/*[
            -0.5, -0.75, 1,
            5, 0.25, 1,
            -0.5, -0.5, 1
        ]*/
        /*[5,0,1,
            10,0,1,
            0,0,1]*/);
        this.geometry.setAttribute('position', new THREE.BufferAttribute(vertices1, 3));
// normals
        this.geometry.computeVertexNormals();
// uv attribute
        /*const vertices2 = new Float32Array([
            0.2, 0.2,
            0.9, 0.9,
            0.2, 0.9
        ]);
        this.geometry.setAttribute('uv', new THREE.BufferAttribute(vertices2, 2));*/


        /*this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array([
            points[0].x, points[0].y, points[0].z,
            points[1].x, points[1].y, points[1].z,
            points[2].x, points[2].y, points[2].z,
        ]), 3));
        this.geometry.setIndex([0,1,2]);
        this.geometry.setAttribute('color', new THREE.Float32BufferAttribute([
            Math.random() * 255,
            Math.random() * 255,
            Math.random() * 255,
            Math.random() * 255
        ], 4))*/
    }
}


const storage = new TrianglesStorage();
export default storage;
