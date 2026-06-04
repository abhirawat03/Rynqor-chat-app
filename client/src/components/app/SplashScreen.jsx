const SplashScreen = () => {

    return (

        <div
            id="splash-screen"
            className="
        fixed
        inset-0
        z-[9999]

        flex
        items-center
        justify-center

        bg-background

        transition-opacity
        duration-500
      "
        >

            <div
                className="flex flex-col items-center gap-5 "
            >

                {/* LOGO */}
                <div
                    className="relative "
                >

                    {/* GLOW */}
                    <div
                        className="absolute inset-0 scale-125 rounded-full bg-accent/20 blur-3xl"
                    />

                    <img
                        src="/favicon.png"
                        alt="Rynqor"
                        width="112"
                        height="112"
                        fetchPriority="high"
                        className="relative z-10 object-contain h-28 w-28 drop-shadow-2xl"
                    />

                </div>

                {/* APP NAME */}
                <div
                    className="text-center "
                >

                    <h1
                        className="text-3xl font-bold tracking-wide text-foreground"
                    >
                        Rynqor
                    </h1>

                    <p
                        className="mt-1 text-sm text-muted"
                    >
                        Connect instantly.
                    </p>

                </div>

                {/* LOADER */}

            </div>

        </div>

    );

};

export default SplashScreen;