import axios from "axios";
import {Triangle} from "../models/triangle";

export default function getTriangles(params: GetTrianglesParameters): Promise<GetTrianglesResponse> {
    return axios
        .post<GetTrianglesResponse>('http://localhost:3001/cone', params)
        .then(res => res.data)
        .then(res => {console.log(res); return res});
}

export interface GetTrianglesParameters {
    height: number;
    radius: number;
    segments: number;
}

export type GetTrianglesResponse = Triangle[];
