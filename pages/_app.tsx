import type { AppProps } from "next/app";
import "../styles/index.css";

export default function MyApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <Component {...pageProps} />


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
}
