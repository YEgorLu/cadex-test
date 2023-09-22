import {spawn} from "child_process";
import type {Triangle} from '../front/src/models/triangle'

class PythonIpc {
    private pythonProcess = spawn('python', ['triangles.py'], {
        env: {PYTHONUNBUFFERED: '1'}
    });
    private outMessages: Record<string | number, Message> = {};

    constructor() {
        this.pythonProcess.stderr.setEncoding('utf-8');
        this.pythonProcess.stdout.setEncoding('utf-8');
        this.pythonProcess.stderr.on('data', (chunk) => {
            const data = JSON.parse(chunk);
            this.outMessages[data.id] = data;
        });
        this.pythonProcess.stdout.on('data', (chunk) => {
            const data = JSON.parse(chunk);
            this.outMessages[data.id] = data;
        });
    }

    public send<Tin = any, Tout=any>(item: Tin): Promise<Tout> {
        const id = Math.random();
        return new Promise((res, rej) => {
            const msg: Message<Tin> = {
                id,
                content: item,
            }
            this.pythonProcess.stdin.write(JSON.stringify(msg));
            this.pythonProcess.stdin.write('\n');
            let interval: NodeJS.Timeout | null = null;
            interval = setInterval(() => {
                if (this.outMessages[id]) {
                    const data: Message<Tout> = this.outMessages[id];
                    delete this.outMessages[id];
                    if (interval) clearInterval(interval);

                    if (data.isError) rej();
                    else res(data.content);
                }
            });
        });
    }
}

export default new PythonIpc();

interface Message<T = any> {
    id: number;
    content: T
    isError?: boolean;
}
