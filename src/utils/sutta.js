import suttaTranslationUrls from "../data/urls/sutta_translation_en_sujato.json";
import blurbUrls from "../data/urls/blurb_en.json";
import htmlUrls from "../data/urls/sutta_html.json";

export class Sutta {
  constructor(sutta) {
    this.sutta = sutta;
    this.collection = sutta.match(/^.*?(?=[0-9])/)[0];
  }

  fetchSutta() {
    const index = suttaTranslationUrls.map((d) => d.sutta).indexOf(this.sutta);
    const url = suttaTranslationUrls[index].url;

    const text = fetch(url)
      .then((resp) => resp.json())
      .catch((error) => console.log(error));

    return text;
  }

  async fetchHTML() {
    const index = htmlUrls.map((d) => d.sutta).indexOf(this.sutta);
    const url = htmlUrls[index].url;

    const text = await fetch(url)
      .then((resp) => resp.json())
      .catch((error) => console.log(error));

    return text;
  }

  async fetchBlurb() {
    const index = blurbUrls.map((d) => d.collection).indexOf(this.collection);
    if (index === -1) return null;

    const url = blurbUrls[index].url;

    const text = await fetch(url)
      .then((resp) => resp.json())
      .catch((error) => console.log(error));

    return text;
  }

  renderSutta() {
    const suttaText = this.fetchSutta();
    const htmlText = this.fetchHTML();
    console.log(suttaText);
    // for (const key in Object.keys(suttaText)) {
    //   console.log(key);
    // }
  }
}
