import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";


import { useEffect } from "react";


import { animations } from "../animations.config";


import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";


const Home: NextPage = () => {

    useEffect(() => {

    }, []);

    return (
        <>
            <Head>
                <title>Random Animations</title>
                <link rel="icon" href="/images/@cover.image.jpg" type="image/jpg" />
            </Head>
            <main className="mx-auto max-w-[1960px] p-4">
                <div className="columns-1 gap-4 sm:columns-2 xl:columns-3 2xl:columns-4">

                    {animations.map(({ id, name, description, version, displayImageURL, animationPageURL }) => (
                        <Link
                            key={id}
                            target="_blank"
                            rel="noopener noreferrer"
                            href={animationPageURL}
                            className="group relative mb-8 block w-full overflow-hidden rounded-2xl border border-white/20 shadow-lg transition-transform duration-300 hover:scale-[1.03]"
                        >
                            {/* Main Image */}
                            <Image
                                alt="Animation Display Image"
                                className="h-[320px] w-full object-cover brightness-90 transition duration-500 group-hover:blur-sm group-hover:brightness-75"
                                src={displayImageURL}
                                width={720}
                                height={480}
                                sizes="(max-width: 640px) 100vw,
                           (max-width: 1280px) 50vw,
                           (max-width: 1536px) 33vw,
                           25vw"
                            />

                            {/* Overlay Text Content */}
                            <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center text-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                                <h2 className="text-2xl font-semibold text-white drop-shadow-lg">{name}</h2>
                                <p className="mt-2 max-w-[80%] text-sm text-white/80">{description}</p>
                            </div>

                            {/* Version Tag - always visible */}
                            <div className="absolute bottom-2 right-3 z-20 rounded-full bg-white/10 px-3 py-1 text-xs font-mono text-white backdrop-blur-md">
                                {name}
                            </div>

                            {/* Version badge on hover bottom-left */}
                            <div className="absolute bottom-3 left-4 z-10 rounded bg-white/10 px-3 py-1 text-xs font-mono text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                v{version}
                            </div>
                        </Link>
                    ))}
                </div>
            </main>


            <footer className="fixed bottom-0 left-0 w-full bg-black/50 p-4 text-center text-white/80 backdrop-blur-md">
                Built By  {""}
                <a
                    href="https://youtube.com/@DineshDOfficial"
                    target="_blank"
                    className="font-semibold text-white hover:underline"
                    rel="noreferrer"
                >
                    Dinesh
                </a>
                {""}  |  {""}
                <a
                    href="https://github.com/DineshDOfficial/random-animations"
                    target="_blank"
                    className="font-semibold hover:underline"
                    rel="noreferrer"
                >
                    (source)
                </a>
            </footer>
        </>
    );
};

export default Home;