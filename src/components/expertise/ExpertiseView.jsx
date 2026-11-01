import ExpertiseFormat1 from "./ExpertiseFormat1";
import ExpertiseFormat2 from "./ExpertiseFormat2";
import ExpertiseFormat3 from "./ExpertiseFormat3";
import ExpertiseFormat4 from "./ExpertiseFormat4";

export default function ExpertiseView({ expertise }) {
    if (!expertise) {
        return <div className="text-center p-10 text-gray-500">No expertise data available.</div>;
    }

    const format = expertise.format || 1;

    return (
        <div className="w-full max-h-[800px] overflow-y-auto overflow-x-hidden custom-scrollbar rounded-2xl">
            <div className="origin-top transition-transform duration-500 transform-gpu">
                {format === 1 && <ExpertiseFormat1 expertise={expertise} />}
                {format === 2 && <ExpertiseFormat2 expertise={expertise} />}
                {format === 3 && <ExpertiseFormat3 expertise={expertise} />}
                {format === 4 && <ExpertiseFormat4 expertise={expertise} />}
            </div>
        </div>
    );
}
