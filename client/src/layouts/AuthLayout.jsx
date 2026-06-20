import { Outlet } from "react-router-dom";

import authImage
    from "../assets/Images/authImage.png";

const AuthLayout = () => {

    return (
        <div
            className="flex w-full h-dvh overflow-hidden transition-colors duration-300 bg-background"
        >

            {/* LEFT SIDE */}
            <div
                className="
          relative

          hidden
          flex-[1.2]
          items-center
          justify-center

          overflow-hidden

          border-r
          border-border

          bg-surface

          px-10

          lg:flex
        "
            >

                {/* GLOW */}
                <div
                    className="
            absolute
            left-1/2
            top-1/2

            h-130
            w-130

            -translate-x-1/2
            -translate-y-1/2

            rounded-full

            bg-accent/10

            blur-3xl
          "
                />

                {/* CONTENT */}
                <div
                    className="relative z-10 flex flex-col items-center max-w-2xl "
                >

                    {/* BRAND */}
                    <h1
                        className="mb-2 text-4xl font-bold tracking-tight text-foreground lg:text-5xl 2xl:text-6xl 3xl:text-7xl"
                    >
                        Rynqor
                    </h1>

                    <p
                        className="max-w-sm text-sm leading-relaxed text-muted lg:text-base 2xl:max-w-xl 2xl:text-lg"
                    >
                        Fast, modern, real-time messaging
                        for seamless conversations.
                    </p>

                    {/* IMAGE */}
                    <img
                        src={authImage}
                        alt="Auth visual"
                        className="object-contain w-full max-w-lg 2xl:max-w-xl"
                    />

                </div>

            </div>

            {/* RIGHT SIDE */}
            <div
                className="flex items-center justify-center flex-1 px-6 lg:px-16 2xl:px-24"
            >

                <div
                    className="w-full max-w-sm lg:max-w-md xl:max-w-lg 2xl:max-w-xl"
                >

                    {/* MOBILE BRAND */}
                    <div
                        className="mb-10 text-center lg:hidden"
                    >

                        <h1
                            className="text-4xl font-bold text-foreground"
                        >
                            Rynqor
                        </h1>

                        <p
                            className="mt-2 text-sm text-muted"
                        >
                            Connect instantly.
                        </p>

                    </div>

                    {/* FORM */}
                    <main className="w-full">
                        <Outlet />
                    </main>

                </div>

            </div>

        </div>
    );
};

export default AuthLayout;