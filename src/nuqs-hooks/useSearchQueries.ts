import { parseAsArrayOf, parseAsString, useQueryStates } from "nuqs"

const params = {
    cat: parseAsArrayOf(parseAsString)
        .withOptions({
            clearOnDefault: true
        }).withDefault([]),
}

export const useSearchQueries = () => {
    return useQueryStates(params)
}