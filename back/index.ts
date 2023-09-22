import http from 'http';
import url from 'url';
import {IncomingMessage, ServerResponse} from 'http';
import ipc from "./python_ipc";
import {Triangle} from "../front/src/models/triangle";
import {Point} from "../front/src/models/point";

export class ConeData {
    height: number;
    radius: number;
    segments: number;
    invalid = false;
    private static keys = new Set(['height', 'radius', 'segments']);

    constructor(obj: any) {
        for (const key of ConeData.keys) {
            if (!(key in obj) || Number.isNaN(+obj[key]) || +obj[key] < 0) {
                this.invalid = true;
                break;
            }

            this[key] = +obj[key];
        }
    }
}


const server = http
    .createServer((req: IncomingMessage, res: ServerResponse) => {
        const {pathname} = url.parse(req.url!, false);
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        if (pathname === '/cone' && req.method === "OPTIONS") {
            res.statusCode = 200;
            res.end();
        }

        if (pathname === '/cone' && req.method === 'POST') {
            const requestBody = [];
            req.on('data', chunk => {
                requestBody.push(chunk.toString());
            });
            req.on('end', () => {
                try {
                    const coneDataRaw: any = JSON.parse(requestBody.join(''));
                    const coneData = new ConeData(coneDataRaw);

                    if (!coneData.invalid) {
                        ipc.send<ConeData,Triangle['points'][]>(coneData)
                            .then((trianglesPoints) => {
                                const trianglesWithNormals: Triangle[] = [];
                                trianglesPoints.forEach((points) => {
                                    const normal = computeNormal(points, coneData.radius, coneData.height);
                                    trianglesWithNormals.push({points, normal})
                                })
                                res.writeHead(200, {'Content-Type': 'application/json'});
                                res.end(JSON.stringify(trianglesWithNormals));
                            })
                            .catch(() => {
                                res.statusCode = 400;
                                res.end('Unexpected error');
                            });
                    } else {
                        res.statusCode = 400;
                        res.end('Invalid cone data');
                    }
                } catch (error) {
                    res.statusCode = 400;
                    res.end('Invalid request body');
                }
            });
        } else {
            res.statusCode = 404;
            res.end();
        }
    });

function computeNormal(trianglePoints: Triangle['points'], radius: number, height: number): Point {
    const B = {x: 0, y: -radius*radius/height, z: 0}
    const side1 = trianglePoints[0];
    const side2 = trianglePoints[1];
    const P = {x: (side1.x + side2.x) / 2, y: 0, z: (side1.z + side2.z)}

    const normalV = {x: P.x - B.x, y: P.y - B.y, z: P.z - B.z};
    const length = Math.hypot(normalV.x, normalV.y, normalV.z);
    Object.entries(normalV).forEach(([k,v]) => normalV[k] = v / length);
    return normalV;
}

server.listen(3001, 'localhost', () => {
    console.log('Server is running on port 3001');
});
