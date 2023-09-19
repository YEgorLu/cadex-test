import style from "./App.module.scss";
import ParamsForm from "./modules/paramsForm/ParamsForm";
import WebGL from "./modules/webgl/Webgl";
import {Triangle} from "./models/triangle";
import {useCallback, useState} from "react";

function App() {
    const [triangles, setTriangles] = useState<Triangle[]>([]);
    const afterGetTriangles = (triangles: Triangle[]) => setTriangles(triangles);

    return (
        <div className={style["App"]}>
            <ParamsForm afterGetTriangles={afterGetTriangles}/>

            <WebGL triangles={triangles}/>
        </div>
    );
}

export default App;
