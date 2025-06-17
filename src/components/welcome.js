import * as d3 from "npm:d3";
import * as htl from "npm:htl";

class Background {
  constructor(_width, _height) {
    this.width = _width;
    this.height = _height;

    this.tileSize = 50;

    this.numRows = Math.floor(this.height / this.tileSize) + 1;
    this.numCols = Math.floor(this.width / this.tileSize) + 1;

    this.xOff = (this.numCols * this.tileSize - this.width) / 2;
    this.yOff = (this.numRows * this.tileSize - this.height) / 2;
    this.textOpacity = { min: 0.3, max: 0.9 };

    this.randomiseLetter = () =>
      Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i))[
        d3.randomInt(26)()
      ];

    this.data = Array.from({ length: this.numCols }, (dx, ix) =>
      Array.from({ length: this.numRows }, (dy, iy) => {
        return {
          id: `${ix}-${iy}`,
          x: ix,
          y: iy,
          letter: this.randomiseLetter(),
          refreshInterval: d3.randomInt(800, 3000)(),
          refreshedAt: performance.now(),
          refreshActive: true,
          hoverLetter: null,
        };
      })
    ).flat();

    this.hoverWords = ["peace", "tranquillity", "wisdom"];
    this.hoverIds = null;
  }

  activateHover(e) {
    const word =
      this.hoverWords[Math.floor(Math.random() * this.hoverWords.length)];
    const letters = word.split("");
    const direction = 1; //d3.range(1, 9)[Math.floor(Math.random() * 8)];
    let ids;
    if (direction === 1) {
      ids = letters.map((_, i) => `tile-${e.x + i}-${e.y}`);
    }
    e.refreshActive = false;
    ids.forEach((d) => d3.select(`#${d} text`).attr("stroke", "purple"));
  }

  deactivateHover(e) {
    e.refreshActive = true;
  }

  tileElement(d) {
    return htl.svg`<g id="tile-${d.id}" class="background-tile">
    <rect x=0 y=0 width=${this.tileSize} height=${
      this.tileSize
    } stroke="#121212" stroke-width=4 rx=10 />
    <text class="background-tile-text" x=${this.tileSize / 2} y=${
      this.tileSize / 2
    } alignment-baseline=middle text-anchor=middle font-family=Inconsolata stroke=white>${
      d.letter
    }</text>
    </g>`;
  }

  render() {
    const self = this;
    const svg = htl.svg`<svg class="welcome-background"></svg>`;

    d3.select(svg)
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("fill", "hsl(0, 0%, 12%)");

    d3.select(svg)
      .append("g")
      .attr("pointer-events", "all")
      .selectAll("g")
      .data(this.data, (d) => d.id)
      .join(
        (enter) =>
          enter
            .append((d) => this.tileElement(d))
            .attr(
              "transform",
              (d) =>
                `translate(${d.x * this.tileSize - this.xOff},${
                  d.y * this.tileSize - this.yOff
                })`
            )
            .attr("stroke-opacity", this.textOpacity.min),
        (update) => update,
        (exit) => exit.remove()
      )
      .on("mouseover", (event, d) => {
        this.activateHover(d);
      })
      .on("mouseout", (event, d) => {
        this.deactivateHover(d);
      });

    d3.timer(() => {
      this.data.forEach((d, i) => {
        const now = performance.now();
        const needsRefresh = now - d.refreshedAt > d.refreshInterval;

        if (needsRefresh && d.refreshActive) {
          const newLetter = this.randomiseLetter();
          d3.select(svg)
            .select(`#tile-${d.id}`)
            .select(".background-tile-text")
            .transition()
            .attr("stroke-opacity", this.textOpacity.min)
            .on("end", function () {
              d3.select(this)
                .text(newLetter)
                .transition()
                .attr("stroke-opacity", self.textOpacity.max);
            });
          this.data[i].refreshedAt = performance.now();
        }
      });
    });

    return svg;
  }
}

export default Background;
