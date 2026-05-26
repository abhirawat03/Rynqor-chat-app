import { useEffect, useRef } from "react";

export const useChatScroll = ({
    containerRef,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    chatMessagesLength,
    isTyping,
    emitReadReceipt,
}) => {

const shouldAutoScrollRef = useRef(true);
const didInitialScroll = useRef(false);

useEffect(() => {

        const container =
            containerRef.current;

        if (!container) {
            return;
        }

        const handleScroll =
            async () => {

                const distanceFromBottom =
                    container.scrollHeight -
                    container.scrollTop -
                    container.clientHeight;

                shouldAutoScrollRef.current =
                    distanceFromBottom < 50;

                emitReadReceipt();

                // -----------------------------------
                // LOAD OLDER MESSAGES
                // -----------------------------------

                const nearTop =
                    container.scrollTop < 100;

                if (
                    nearTop &&
                    hasNextPage &&
                    !isFetchingNextPage
                ) {

                    const previousHeight =
                        container.scrollHeight;

                    await fetchNextPage();

                    requestAnimationFrame(
                        () => {

                            requestAnimationFrame(
                                () => {

                                    const newHeight =
                                        container.scrollHeight;

                                    container.scrollTop +=
                                        newHeight -
                                        previousHeight;
                                }
                            );
                        }
                    );
                }
            };

        container.addEventListener(
            "scroll",
            handleScroll
        );

        return () => {

            container.removeEventListener(
                "scroll",
                handleScroll
            );
        };

    }, [
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        emitReadReceipt,
    ]);

useEffect(() => {

        const container =
            containerRef.current;

        if (!container) {
            return;
        }

        if (
            shouldAutoScrollRef.current ||
            !didInitialScroll.current
        ) {

            requestAnimationFrame(
                () => {

                    container.scrollTop =
                        container.scrollHeight;

                    didInitialScroll.current =
                        true;
                }
            );
        }

    }, [
        chatMessagesLength,
        isTyping,
    ]);

    return {};
}