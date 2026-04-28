import { MISTAKE_DEFAULT_PAGE_SIZE } from "@/configs/const/mistake";
import { TEST_ATTEMPT_DEFAULT_PAGE_SIZE } from "@/configs/const/test-attempt";
import { prefetch, trpc } from "@/trpc/server";

export const prefetchTestAttempts = () => {
        return prefetch(
            trpc.testAttempt.view.infiniteQueryOptions(
                { limit: TEST_ATTEMPT_DEFAULT_PAGE_SIZE },
                {
                    getNextPageParam: (lastPage) => lastPage.nextCursor,
                },
            ),
        );
};

export const prefetchMistakes = () => {
        return prefetch(
            trpc.mistake.view.infiniteQueryOptions(
                { limit: MISTAKE_DEFAULT_PAGE_SIZE },
                {
                    getNextPageParam: (lastPage) => lastPage.nextCursor,
                },
            ),
        );
};
