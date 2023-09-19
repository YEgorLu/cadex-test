import http from 'http';
import url from 'url';
import {IncomingMessage, ServerResponse} from 'http';

class ConeData {
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

        console.log(pathname);
        if (pathname === '/cone' && req.method === 'POST') {
            let requestBody = [];
            req.on('data', chunk => {
                requestBody.push(chunk.toString());
            });
            req.on('end', () => {
                try {
                    const coneDataRaw: any = JSON.parse(requestBody.join(''));
                    const coneData = new ConeData(coneDataRaw);

                    if (!coneData.invalid) {
                        const result = calculateCone(coneData);
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.end(JSON.stringify(result));
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

function calculateCone(coneData: ConeData): any[] {
    // your cone calculation logic here
    return [];
}
server.listen(3001, 'localhost', () => {
    console.log('Server is running on port 3001');
});
