import * as d3 from "npm:d3";
import * as htl from "npm:htl";

class Background {
  constructor() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.tileSize = 60;

    this.numRows = Math.floor(this.height / this.tileSize) + 1;
    this.numCols = Math.floor(this.width / this.tileSize) * 3;

    this.randomiseLetter = () =>
      Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i))[
        d3.randomInt(26)()
      ];

    this.data = Array.from({ length: this.numCols }, (dx, ix) =>
      Array.from({ length: this.numRows }, (dy, iy) => {
        const letter = this.randomiseLetter();

        return {
          id: `${ix}-${iy}`,
          x: ix,
          y: iy,
          letter: letter,
          refreshInterval: d3.randomInt(800, 3000)(),
          refreshedAt: performance.now(),
        };
      })
    ).flat();
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
    const svg = htl.svg`<svg class="welcome-background"></svg>`;

    d3.select(svg)
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("fill", "hsl(0, 0%, 12%)");

    const gTile = d3.select(svg).append("g").attr("pointer-events", "all");
    const tiles = gTile.selectAll("g").data(this.data, (d) => d.id);

    const yOff = (this.numRows * this.tileSize - this.height) / 2;
    const textOpacity = { min: 0.2, max: 0.7 };

    tiles.join(
      (enter) =>
        enter
          .append((d) => this.tileElement(d))
          .attr(
            "transform",
            (d) =>
              `translate(${d.x * this.tileSize},${d.y * this.tileSize - yOff})`
          )
          .attr("stroke-opacity", textOpacity.min),
      (update) => update,
      (exit) => exit.remove()
    );

    d3.timer(() => {
      this.data.forEach((d, i) => {
        const now = performance.now();
        const needsRefresh = now - d.refreshedAt > d.refreshInterval;

        if (needsRefresh) {
          const newLetter = this.randomiseLetter();
          const duration = 300;
          d3.select(`#tile-${d.id}`)
            .select(".background-tile-text")
            .transition()
            .duration(duration)
            .attr("stroke-opacity", textOpacity.min)
            .on("end", function () {
              d3.select(this)
                .text(newLetter)
                .transition()
                .duration(duration)
                .attr("stroke-opacity", textOpacity.max);
            });
          this.data[i].refreshedAt = performance.now();
        }
      });
    });

    return svg;
  }
}

export default Background;
