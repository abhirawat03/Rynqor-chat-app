import {
  NavLink,
  useLocation,
} from "react-router-dom";

import {
  IoMdChatbubbles,
} from "react-icons/io";

import {
  ImSearch,
} from "react-icons/im";

import {
  BsPersonCircle,
} from "react-icons/bs";

import {
  useCurrentUserQuery,
} from "../../hooks/auth/useCurrentUserQuery.js";

const Navigation = () => {

  const location =
    useLocation();

  const {
    data: currentUser,
  } = useCurrentUserQuery();

  const tabs = [
    {
      label: "Chats",
      path: "/",
      icon: (
        <IoMdChatbubbles
          size={24}
        />
      ),
    },

    {
      label: "Search",
      path: "/search",
      icon: (
        <ImSearch
          size={22}
        />
      ),
    },

    {
      label: "Profile",
      path: "/profile",
    },
  ];

  const renderProfileIcon =
    (active) => {

      if (
        currentUser?.avatar?.url
      ) {

        return (
          <img
            src={
              currentUser.avatar.url
            }

            alt={
              currentUser.fullName
            }

            className={`
              h-6
              w-6

              rounded-full
              object-cover

              transition-all
              duration-200

              ${
                active
                  ? `
                      ring-2
                      ring-accent
                    `
                  : `
                      ring-2
                      ring-transparent
                    `
              }
            `}
          />
        );

      }

      return (
        <BsPersonCircle
          size={24}
        />
      );

    };

  return (
    <>

      {/* MOBILE NAV */}
      <div
        className="
          fixed
          bottom-0
          left-0
          right-0
          z-50

          flex
          h-14
          items-center
          justify-around

          border-t
          border-border

          bg-surface

          backdrop-blur-xl

          transition-colors
          duration-300

          md:hidden
        "
      >

        {tabs.map((tab) => (

          <NavLink
            key={tab.path}

            to={tab.path}

            end={
              tab.path === "/"
            }

            className={({
              isActive,
            }) => {

              const active =
                isActive ||

                (
                  tab.path === "/" &&

                  location.pathname.startsWith(
                    "/chat/"
                  )
                );

              return `
                flex
                flex-col
                items-center

                text-sm

                transition-colors
                duration-200

                focus:outline-none

                ${
                  active

                    ? `
                        text-accent
                      `

                    : `
                        text-muted
                        hover:text-foreground
                      `
                }
              `;

            }}
          >

            {({
              isActive,
            }) => {

              const active =
                isActive ||

                (
                  tab.path === "/" &&

                  location.pathname.startsWith(
                    "/chat/"
                  )
                );

              return (
                <>

                  {tab.path ===
                  "/profile"

                    ? renderProfileIcon(
                      active
                    )

                    : tab.icon}

                  <span>
                    {tab.label}
                  </span>

                </>
              );

            }}

          </NavLink>

        ))}

      </div>

      {/* DESKTOP SIDEBAR */}
      <div
        className="
          hidden

          border-r
          border-border

          bg-surface

          transition-colors
          duration-300

          md:flex
          md:w-20
          md:flex-col
          md:items-center
          md:gap-6
          md:py-6
        "
      >

        {tabs.map((tab) => (

          <NavLink
            key={tab.path}

            to={tab.path}

            end={
              tab.path === "/"
            }

            className={({
              isActive,
            }) => {

              const active =
                isActive ||

                (
                  tab.path === "/" &&

                  location.pathname.startsWith(
                    "/chat/"
                  )
                );

              return `
                flex
                flex-col
                items-center
                gap-1

                rounded-xl

                p-3

                text-sm

                transition-all
                duration-200

                focus:outline-none

                active:scale-[0.98]

                ${
                  active

                    ? `
                        bg-hover
                        text-accent
                      `

                    : `
                        text-muted
                        hover:bg-hover
                        hover:text-foreground
                      `
                }
              `;

            }}
          >

            {({
              isActive,
            }) => {

              const active =
                isActive ||

                (
                  tab.path === "/" &&

                  location.pathname.startsWith(
                    "/chat/"
                  )
                );

              return (
                <>

                  {tab.path ===
                  "/profile"

                    ? renderProfileIcon(
                      active
                    )

                    : tab.icon}

                  <span>
                    {tab.label}
                  </span>

                </>
              );

            }}

          </NavLink>

        ))}

      </div>

    </>
  );

};

export default Navigation;