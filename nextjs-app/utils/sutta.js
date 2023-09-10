"use client";

import pull from "@/utils/pull";

import translationUrls from "../data/urls/sutta_translation_en_sujato.json";
import blurbUrls from "../data/urls/blurb_en.json";
import htmlUrls from "../data/urls/sutta_html.json";

export default function Sutta(sutta) {
  const collection = sutta.match(/^.*?(?=[0-9])/)[0];

  const fetchTranslation = () => {
    const index = translationUrls.map((d) => d.sutta).indexOf(sutta);
    const url = translationUrls[index].url;

    return pull(url).json();
  };

  const fetchHTML = () => {
    const index = htmlUrls.map((d) => d.sutta).indexOf(sutta);
    const url = htmlUrls[index].url;

    return pull(url).json();
  };

  const fetchBlurb = () => {
    const index = blurbUrls.map((d) => d.collection).indexOf(collection);
    if (index === -1) return null;

    const url = blurbUrls[index].url;

    return pull(url).json();
  };

  const renderTranslation = () => {
    let translation = fetchTranslation();
    let html = fetchHTML();

    if (
      translation.isLoading ||
      html.isLoading ||
      translation.isError ||
      html.isError
    )
      return null;

    translation = translation.data;
    html = html.data;

    let markedupTranslation = html;

    Object.keys(markedupTranslation).forEach((key) => {
      const replacement = translation[key];
      markedupTranslation[key] = markedupTranslation[key].replace(
        "{}",
        replacement
      );
    });

    return markedupTranslation;
  };

  Object.defineProperties(this, {
    collection: {
      get: function () {
        return collection;
      },
    },
    translation: {
      get: function () {
        return fetchTranslation();
      },
    },
    html: {
      get: function () {
        return fetchHTML();
      },
    },
    blurb: {
      get: function () {
        return fetchBlurb();
      },
    },
    renderTranslation: {
      get: function () {
        return renderTranslation();
      },
    },
  });

  // renderSutta() {
  //   const x = this.fetchTranslation();

  //   const { htmlText, htmlIsLoading, htmlIsError } = this.fetchHTML();

  //   // console.log(suttaText);
  //   console.log(x.isLoading);
  //   if (x.isLoading) return console.log("Loading");
  //   console.log(x);
  //   // for (const key in Object.keys(x.data)) {
  //   //   console.log(key);
  //   // }
  // }
}

// export class Sutta {
//   constructor(sutta) {
//     this.sutta = sutta;
//     this.collection = sutta.match(/^.*?(?=[0-9])/)[0];
//   }

//   fetchTranslation() {
//     const index = translationUrls.map((d) => d.sutta).indexOf(this.sutta);
//     const url = translationUrls[index].url;

//     return fetchjson(url);

//     // const { data, error, isLoading } = useSWR(url, fetchjson);

//     // return {
//     //   data,
//     //   isLoading,
//     //   isError: error,
//     // };
//   }

//   fetchHTML() {
//     const index = htmlUrls.map((d) => d.sutta).indexOf(this.sutta);
//     const url = htmlUrls[index].url;

//     const { data, error, isLoading } = useSWR(url, fetchjson);

//     return {
//       data,
//       isLoading,
//       isError: error,
//     };
//   }

//   // async fetchBlurb() {
//   //   const index = blurbUrls.map((d) => d.collection).indexOf(this.collection);
//   //   if (index === -1) return null;

//   //   const url = blurbUrls[index].url;

//   //   const text = await fetch(url)
//   //     .then((resp) => resp.json())
//   //     .catch((error) => console.log(error));

//   //   return text;
//   // }

//   renderSutta() {
//     const x = this.fetchTranslation();

//     const { htmlText, htmlIsLoading, htmlIsError } = this.fetchHTML();

//     // console.log(suttaText);
//     console.log(x.isLoading);
//     if (x.isLoading) return console.log("Loading");
//     console.log(x);
//     // for (const key in Object.keys(x.data)) {
//     //   console.log(key);
//     // }
//   }
// }
