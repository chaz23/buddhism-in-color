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
          id: `${ix},${iy},${letter}`,
          x: ix,
          y: iy,
          letter: letter,
          refreshTime: d3.randomInt(800, 1000)(),
        };
      })
    ).flat();
  }

  tileElement(d) {
    return htl.svg`<g class="background-tile">
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
    const yOff = (this.numRows * this.tileSize - this.height) / 2;

    const svg = htl.svg`<svg class="welcome-background"></svg>`;
    const background = d3
      .select(svg)
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("fill", "hsl(0, 0%, 12%)");

    const gTile = d3.select(svg).append("g").attr("pointer-events", "all");

    const self = this;
    function update(tileData) {
      const tile = gTile.selectAll("g").data(tileData, (d) => d.id);

      tile.join(
        (enter) =>
          enter
            .append((d) => self.tileElement(d))
            .attr(
              "transform",
              (d) =>
                `translate(${d.x * self.tileSize},${
                  d.y * self.tileSize - yOff
                })`
            )
            .attr("stroke-opacity", 0)
            .transition()
            .duration(500)
            .attr("stroke-opacity", 1)
            .selection(),
        (update) => update, //.attr("x", (d) => console.log(d)),
        // .attr("stroke", "white")
        // .transition()
        // .duration(1000)
        // .attr("stroke", "red")
        // .selection(),
        (exit) => exit.remove()
      );
    }

    this.data.map((d, i) =>
      setInterval(() => {
        const letter = this.randomiseLetter();
        this.data[i] = {
          ...d,
          letter: letter,
          id: `${d.x},${d.y},${letter}`,
        };
        update(this.data);
      }, d.refreshTime)
    );

    update(this.data);
    return svg;
  }
}

export default Background;
