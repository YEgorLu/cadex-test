import {FC, FormEvent, useCallback, useState} from "react";
import {Triangle} from "../../models/triangle";
import getTriangles, {GetTrianglesParameters} from "../../requests/get-triangles";
import style from "./ParamsForm.module.scss";

export interface ParamsFormProps {
    afterGetTriangles: (triangles: Triangle[]) => void;
}

const ParamsForm: FC<ParamsFormProps> = ({afterGetTriangles}) => {
    const [height, setHeight] = useState<number>(0);
    const [radius, setRadius] = useState<number>(0);
    const [segments, setSegments] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchTriangles = useCallback((params: GetTrianglesParameters) => getTriangles(params), [height, radius, segments]);
    const onSubmit = (ev: FormEvent<HTMLFormElement>) => {
        ev.preventDefault();
        setLoading(true);
        fetchTriangles({height, radius, segments})
            .then(resp => {
                setLoading(false);
                afterGetTriangles(resp.triangles);
                console.log('completed');
            })
            .catch(() => alert('Something went wrong'));
    }

    return (
        <form className={style["Form"]} onSubmit={onSubmit}>
            <label htmlFor="height">Height</label>
            <input className={style["Input"]} id="height" type="number" onInput={(ev) => setHeight(+ev.currentTarget.value)}/>

            <label htmlFor="radius">Radius</label>
            <input className={style["Input"]} id="radius" type="number" onInput={(ev) => setRadius(+ev.currentTarget.value)}/>

            <label htmlFor="segments">Segments</label>
            <input className={style["Input"]} id="segments" type="number" onInput={(ev) => setSegments(+ev.currentTarget.value)}/>

            <button className={style["Button"]} disabled={loading} type="submit">
                {loading
                    ? <span className={style.Loader}>loading</span>
                    : <span>Confirm</span>
                }
            </button>
        </form>
    );
}

export default ParamsForm;
