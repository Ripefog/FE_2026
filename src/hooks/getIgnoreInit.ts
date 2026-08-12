// import socket from "@/lib/socket";
// import { useIgnoreImageContext } from "@/contexts/ignoreContext";

// export const useFetchIgnoredImages = (query_name: string) => {
//     const {setIgnoredMap} = useIgnoreImageContext()
//     socket.emit("getIgnoredImages", { query_name });

//     socket.once("ignoredImagesResult", (results: { keyframe_id: string; username: string; query_name: string }[]) => {
//         setIgnoredMap((prev) => {
//             const updated = new Map(prev);
//             results.forEach(({ keyframe_id, username, query_name }) => {
//                 if (!updated.has(query_name)) {
//                     updated.set(query_name, new Map());
//                 }
//                 updated.get(query_name)!.set(keyframe_id, username);
//             });
//             return updated;
//         });
//     });
// };

// hooks/getIgnoreInit.ts
import socket from "@/lib/socket";
import { useIgnoreImageContext } from "@/contexts/ignoreContext";

export const useFetchIgnoredImages = () => {
    const { setIgnoredMap } = useIgnoreImageContext();

    const fetchIgnoredImages = (query_name: string) => {
        socket.emit("getIgnoredImages", { query_name });

        socket.once("ignoredImagesResult", (results: { keyframe_id: string; username: string; query_name: string }[]) => {
            setIgnoredMap((prev) => {
                const updated = new Map(prev);
                results.forEach(({ keyframe_id, username, query_name }) => {
                    if (!updated.has(query_name)) {
                        updated.set(query_name, new Map());
                    }
                    updated.get(query_name)!.set(keyframe_id, username);
                });
                return updated;
            });
        });
    };

    return { fetchIgnoredImages };
};
