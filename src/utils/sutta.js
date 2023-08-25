export class Sutta {
  constructor(sutta) {
    this.sutta = sutta;
  }

  collection = this.sutta; //.match(/^.*?(?=[0-9])/)[0];

  fetchSutta() {
    const collection = this.sutta.match(/^.*?(?=[0-9])/)[0];
    const nikaya = ["dn", "mn", "sn", "an"].includes(collection)
      ? collection
      : "kn";

    let val;
    if (["dn", "mn"].includes(nikaya)) {
      val = this.sutta;
    } else if (["sn", "an"].includes(nikaya)) {
      let chapter = this.sutta.split(".")[0];
      val = `${chapter}/${this.sutta}`;
    } else if (["thag", "thig", "dhp"].includes(nikaya)) {
      val = `${collection}/${this.sutta}`;
    }

    const url = `https://raw.githubusercontent.com/suttacentral/bilara-data/published/translation/en/sujato/sutta/${nikaya}/${val}_translation-en-sujato.json`;

    return url;
  }

  // fetchSutta() {
  //   const suttaPrefix =
  //     "https://raw.githubusercontent.com/suttacentral/bilara-data/published/translation/en/sujato/sutta/";
  //   const suttaFormatPrefix =
  //     "https://raw.githubusercontent.com/suttacentral/bilara-data/published/html/pli/ms/sutta/";

  //   const suttaSuffix = "_translation-en-sujato.json";
  //   const suttaFormatSuffix = "_html.json";

  //   const nikaya = this.sutta.substring(0, 2);

  //   let middleValue;
  //   if (nikaya === "dn" || nikaya === "mn") {
  //     middleValue = nikaya + "/" + this.sutta;
  //   } else {
  //     let chapter = this.sutta.split(".");
  //     chapter = chapter[0];
  //     middleValue = nikaya + "/" + chapter + "/" + this.sutta;
  //   }
  //   const suttaURL = suttaPrefix + middleValue + suttaSuffix;
  //   const suttaFormatURL = suttaFormatPrefix + middleValue + suttaFormatSuffix;

  //   return suttaURL;
  // }

  fetchBlurb() {}

  fetchTags() {}
}
