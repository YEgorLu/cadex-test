import {FC} from "react";
import {Triangle} from "../../models/triangle";

export interface WebGLProps {
    triangles: Triangle[];
}

const WebGL: FC<WebGLProps> = ({triangles}) => {
    return (
        <>
            <span>there will be webgl</span>
            {JSON.stringify(triangles)}
        </>
    );
}

export default WebGL;
