import Link from "next/link";

type Props = {
    id: string;
    name: string;
    description: string;
    version: string;
};

export default function AnimationCard({ id, name, description, version }: Props) {
    return (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-5 shadow-xl transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl border border-gray-700">
            <h2 className="text-2xl font-semibold mb-2 text-white">{name}</h2>
            <p className="text-gray-400">{description}</p>
            <p className="text-xs text-gray-500 mt-2">Version {version}</p>
            <Link href={`/animations/${id}`} target="_blank">
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200">
                    View Animation
                </button>
            </Link>
        </div>
    );
}
