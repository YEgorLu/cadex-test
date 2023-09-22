import {spawn} from "child_process";

class PythonIpc {
    private pythonProcess = spawn('python', ['triangles.py'], {
        env: {PYTHONUNBUFFERED: '1'}
    });
    private outMessages: Record<string | number, any> = {};

    constructor() {
        this.pythonProcess.stderr.setEncoding('utf-8');
        this.pythonProcess.stdout.setEncoding('utf-8');
        this.pythonProcess.stderr.on('data', (chunk) => {
            const data = JSON.parse(chunk);
            this.outMessages[data.id] = data.content;
        });
        this.pythonProcess.stdout.on('data', (chunk) => {
            const data = JSON.parse(chunk);
            this.outMessages[data.id] = data.content;
        });
    }

    public send<T = any>(item: T) {
        const id = Math.random();
        return new Promise((res, rej) => {
            const msg: Message<T> = {
                id,
                content: item,
            }
            this.pythonProcess.stdin.write(JSON.stringify(msg));
            this.pythonProcess.stdin.write('\n');
            let interval: NodeJS.Timeout | null = null;
            interval = setInterval(() => {
                if (this.outMessages[id]) {
                    const data = this.outMessages[id];
                    delete this.outMessages[id];
                    if (interval) clearInterval(interval);

                    if (data === 'error') rej();
                    else res(data);
                }
            });
        });
    }
}

export default new PythonIpc();

interface Message<T = any> {
    id: number;
    content: T
}
