import React from "react";
import Expertise1 from "./Expertie1";
import Expertise2 from "./Expertie2";
import Expertise3 from "./Expertie3";
import Expertise4 from "./Expertie4";

export default function MyExperties({ expertise }) {
    if (!expertise) {
        return <div className="text-center p-10 text-gray-500">No expertise data available.</div>;
    }

    const format = expertise.format || 1;

    return (
        <>
            {format === 1 && <Expertise1 expertise={expertise} />}
            {format === 2 && <Expertise2 expertise={expertise} />}
            {format === 3 && <Expertise3 expertise={expertise} />}
            {format === 4 && <Expertise4 expertise={expertise} />}
        </>
    );
}
