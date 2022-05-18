import fetch from 'node-fetch';
import { GitRelease } from '../typings/git';

const updateLink = `https://api.github.com/repos/Ascynx/MDPT/releases/latest`;

const gitFetchJson = async (url: string) => {
    const body = await fetch(url);

    const json: any = await body.json();

    if (!body.ok) return new Error(`${json?.status ? json.status : "unknown error"} - ${json?.statusText ? json.statusText : "unknown cause"}`);
    if (json.message) return new Error(`Error 404 - ${json.message}`);

    return json;
}

export const getUpdate = async () => {
    const update: GitRelease | Error = await gitFetchJson(updateLink);

    if (update instanceof Error) throw update;
    
    return update;
}