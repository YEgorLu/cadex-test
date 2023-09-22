import style from "./App.module.scss";
import ParamsForm from "./modules/paramsForm/ParamsForm";
import WebGL from "./modules/webgl/Webgl";
import {Triangle} from "./models/triangle";
import {useCallback, useEffect, useState} from "react";

function App() {
    const [triangles, setTriangles] = useState<Triangle[]>([]);
    const [height, setHeight] = useState(0);
    const [radius, setRadius] = useState(0);
    const [smoothing, setSmoothing] = useState(false);

    const afterGetTriangles = (triangles: Triangle[], height: number, radius: number) => {
        setTriangles(triangles);
        setHeight(height);
        setRadius(radius);
    }

    useEffect(() => {
        console.log(smoothing)
    }, [smoothing]);

    return (
        <div className={style["App"]}>
            <ParamsForm afterGetTriangles={afterGetTriangles}/>

            <div>
                <label>Use smoothing
                    <input type="checkbox" checked={smoothing} onChange={(ev) => setSmoothing(ev.currentTarget.checked)}/>
                </label>
                <WebGL triangles={triangles} radius={radius} height={height} useSmoothing={smoothing}/>
            </div>
        </div>
    );
}

export default App;
