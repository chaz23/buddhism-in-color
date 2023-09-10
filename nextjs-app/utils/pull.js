"use client";

import useSWR from "swr";

async function fetchjson(url) {
  const data = await fetch(url)
    .then((res) => res.json())
    .catch((error) => console.log(error));

  return data;
}

export default function pull(url) {
  return {
    json: function () {
      const { data, error, isLoading } = useSWR(url, fetchjson);

      return {
        data,
        isLoading,
        isError: error,
      };
    },
  };
}
