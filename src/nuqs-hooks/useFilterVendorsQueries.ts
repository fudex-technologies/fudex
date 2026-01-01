import { parseAsArrayOf, parseAsString, useQueryStates } from "nuqs"

const params = {
  rating: parseAsString
    .withOptions({
      clearOnDefault: true
    }).withDefault(""),
  deliveryFee: parseAsString
    .withOptions({
      clearOnDefault: true
    }).withDefault(""),
  deliveryTime: parseAsString
    .withOptions({
      clearOnDefault: true
    }).withDefault(""),
}

export const useFilterVendorsQueries = () => {
  return useQueryStates(params)
}