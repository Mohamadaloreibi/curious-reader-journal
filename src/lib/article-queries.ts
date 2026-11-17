import { queryOptions } from "@tanstack/react-query";
import { getPublicArticles } from "./journal.functions";
export const publicArticlesQuery = queryOptions({ queryKey: ["public-articles"], queryFn: () => getPublicArticles(), staleTime: 30000 });