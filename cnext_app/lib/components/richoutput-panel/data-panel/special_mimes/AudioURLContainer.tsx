import React from "react";

const auditoTypeMap: { [type: string]: string } = {
    mp3: "audio/mpeg",
    ogg: "audio/ogg",
    wav: "audio/wav",
};

const getFileEnding = (path: string | null) => {
    if (path) {
        const splits = path.split(".");
        if (path.split(".").length > 0) return splits[path.split(".").length - 1];
    }
    return null;
};

export function AudioURLContainer({ url }: { url: string }) {
    const fileEnding = getFileEnding(url);

    return (
        <>
            {fileEnding && (
                <audio controls >
                    <source src={url} type={auditoTypeMap[fileEnding]} />
                </audio>
            )}
        </>
    );
}

export default AudioURLContainer;
