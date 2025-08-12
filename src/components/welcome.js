import * as d3 from "npm:d3";
import * as htl from "npm:htl";
import { FileAttachment } from "observablehq:stdlib";

const words = await FileAttachment(
  "../data/welcome_page_hover_words.json"
).json();

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

    this.data = Array.from({ length: this.numCols }, (_, ix) =>
      Array.from({ length: this.numRows }, (_, iy) => {
        return {
          id: `${ix}-${iy}`,
          x: ix,
          y: iy,
          letter: this.randomiseLetter(),
          refreshInterval: d3.randomInt(800, 3000)(),
          refreshedAt: performance.now(),
          refreshActive: true,
        };
      })
    ).flat();

    this.hoverWords = words.map((d) => d.word);
    this.hoverIds = null;
  }

  lotus() {
    const dpr = window.devicePixelRatio || 1;

    const canvas = htl.html`<canvas class='welcome-lotus' style="width:${
      this.width
    }px; height:${this.height}px;" width=${this.width * dpr} height=${
      this.height * dpr
    }></canvas>`;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const units = (x) => {
      // Return a number of pixels such that 10 units = width of screen
      const unit = this.width / 10;
      return x * unit;
    };

    const colors = {
      white: "#FFFFFF",
      red: "#D01C8B",
      green: "#4DAC26",
      blue: "#44BAD2",
    };

    const interpolate = d3.interpolateRgbBasis([
      colors.white,
      colors.red,
      colors.red,
      colors.green,
      colors.green,
      colors.blue,
      colors.blue,
      colors.blue,
    ]);

    const alpha = (i, length) => {
      const scale = d3
        .scalePow()
        .domain([0, length])
        .range([0, 0.7])
        .exponent(8);

      return 1 - scale(i);
    };

    const drawLotus = (ctx, x0, y0, r) => {
      const p = Array.from({ length: 1500 }, () => [
        Math.random() * 2 * units(r),
        Math.random() * 2 * units(r),
      ]);
      const delaunay = d3.Delaunay.from(p);

      const { points, triangles } = delaunay;

      ctx.save();
      ctx.translate(units(x0) - units(r), units(y0) - units(r));
      for (let i = 0; i < points.length; i++) {
        const t0 = triangles[i * 3 + 0];
        const t1 = triangles[i * 3 + 1];
        const t2 = triangles[i * 3 + 2];

        ctx.beginPath();
        ctx.moveTo(points[t0 * 2], points[t0 * 2 + 1]);
        ctx.lineTo(points[t1 * 2], points[t1 * 2 + 1]);
        ctx.lineTo(points[t2 * 2], points[t2 * 2 + 1]);
        ctx.closePath();

        const color = interpolate(i / points.length);
        ctx.globalAlpha = alpha(i, points.length / 1.75);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();
    };

    drawLotus(ctx, 5, 5, 2);

    return canvas;
  }

  mesh() {
    const dpr = window.devicePixelRatio || 1;

    const canvas = htl.html`<canvas class='welcome-voronoi-mesh' style="width:${
      this.width
    }px; height:${this.height}px;" width=${this.width * dpr} height=${
      this.height * dpr
    }></canvas>`;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const fillIncrementer = d3
      .scaleLinear()
      .domain([0, 1])
      .range([0.015, 0.035]);
    const fillInterpolator = d3.scaleLinear().domain([-1, 1]).range([0.3, 0.8]);
    const fill = (t) => d3.interpolateRdPu(fillInterpolator(Math.sin(t)));

    const numCells = 2000;

    let data = Array.from({ length: numCells }, () => ({
      x: d3.randomInt(0, Math.floor(this.width))(),
      y: d3.randomInt(0, Math.floor(this.height))(),
      t: d3.scaleLinear().domain([0, 1]).range([0, 4])(Math.random()),
      incrementer: fillIncrementer(Math.random()),
    }));

    const voronoi = d3.Delaunay.from(
      data,
      (d) => d.x,
      (d) => d.y
    ).voronoi([0, 0, this.width, this.height]);

    const rmax = this.width > this.height ? this.height / 2 : this.width / 2;
    const scale = d3.scaleLinear().domain([0, 1]).range([0, rmax]);

    class Petal {
      constructor(_context, _units, _ctrls) {
        this.ctx = _context;
        this.units = _units;
        this.ctrls = _ctrls;
      }

      render() {
        const tipOffset = d3.randomUniform(-100, 100)();
        const path = new Path2D();

        path.moveTo(0, 0);
        path.bezierCurveTo(
          -this.ctrls.ctrl1,
          this.units / 3,
          -this.ctrls.ctrl2,
          (this.units / 3) * 2,
          0 + tipOffset,
          this.units
        );
        path.bezierCurveTo(
          this.ctrls.ctrl2 + tipOffset,
          (this.units / 3) * 2,
          this.ctrls.ctrl1,
          this.units / 3,
          0,
          0
        );
        return path;
      }
    }

    const degToRad = (degrees) => (degrees * Math.PI) / 180;

    // ctx.save();
    // ctx.translate(this.width / 2, this.height / 2);
    // ctx.moveTo(0, 0);

    // for (let i = 0; i < 2; ++i) {
    //   ctx.save();
    //   ctx.rotate(degToRad(90) * i);
    //   const p = new Petal(ctx, scale(0.8), { ctrl1: 150, ctrl2: 50 });
    //   const path = p.render();
    //   ctx.stroke(path); // Optional: draw outline
    //   ctx.clip(path); // Clip this petal only
    //   ctx.restore(); // Restore rotation
    // }

    // ctx.restore();

    // d3.timer(() => {
    //   ctx.clearRect(0, 0, this.width, this.height);

    //   data.map((d, i) => {
    //     const bounds = voronoi.renderCell(i);
    //     const path = new Path2D(bounds);
    //     ctx.globalAlpha = 0.8;
    //     ctx.strokeStyle = "white";
    //     ctx.lineWidth = 1;
    //     ctx.stroke(path);
    //     ctx.fillStyle = fill(d.t);
    //     ctx.fill(path);
    //   });

    //   data = data.map((d) => ({ ...d, t: d.t + d.incrementer }));
    // });

    d3.timer(() => {
      ctx.clearRect(0, 0, this.width, this.height);

      const combinedPath = new Path2D();
      ctx.save();
      ctx.translate(this.width / 2, this.height / 2);

      for (let i = 0; i < 2; ++i) {
        ctx.save();
        ctx.rotate(degToRad(90) * i);
        const p = new Petal(ctx, scale(0.8), { ctrl1: 150, ctrl2: 50 });
        const path = p.render();
        combinedPath.addPath(path, ctx.getTransform());
        ctx.restore();
      }

      ctx.restore();
      ctx.save();
      ctx.clip(combinedPath); // Apply clipping region inside timer

      // Draw the Voronoi mesh
      data.forEach((d, i) => {
        const bounds = voronoi.renderCell(i);
        const path = new Path2D(bounds);
        ctx.globalAlpha = 0.8;
        ctx.strokeStyle = "white";
        ctx.lineWidth = 1;
        ctx.stroke(path);
        ctx.fillStyle = fill(d.t);
        ctx.fill(path);
      });

      ctx.restore(); // Restore to remove clip after drawing

      // Animate data
      data = data.map((d) => ({ ...d, t: d.t + d.incrementer }));
    });

    return canvas;
  }

  activateHover(e) {
    const offsets = [
      { direction: 1, xOff: 1, yOff: 0 },
      { direction: 2, xOff: 1, yOff: 1 },
      { direction: 3, xOff: 0, yOff: 1 },
      { direction: 4, xOff: -1, yOff: 1 },
      { direction: 5, xOff: -1, yOff: 0 },
      { direction: 6, xOff: -1, yOff: -1 },
      { direction: 7, xOff: 0, yOff: -1 },
      { direction: 8, xOff: 1, yOff: -1 },
    ];
    const direction = d3.range(1, 9)[Math.floor(Math.random() * 8)];
    const word =
      this.hoverWords[Math.floor(Math.random() * this.hoverWords.length)];
    let letters = word.split("");
    letters = direction > 4 && direction < 8 ? letters.reverse() : letters;

    this.hoverIds = letters.map((_, i) => {
      const o = offsets.filter((d) => d.direction === direction)[0];
      return `tile-${e.x + i * o.xOff}-${e.y + i * o.yOff}`;
    });

    setTimeout(() => {
      if (this.hoverIds !== null) {
        this.data
          .filter((d) => this.hoverIds.includes(`tile-${d.id}`))
          .forEach((d) => (d.refreshActive = false));

        this.hoverIds.forEach((d, i) =>
          d3
            .select(`#${d} text`)
            .transition()
            .selection()
            .attr("stroke", "purple")
            .text(letters[i])
        );
      }
    }, 200);
  }

  deactivateHover() {
    this.hoverIds.forEach((d, i) =>
      d3.select(`#${d} text`).attr("stroke", "white")
    );

    this.data
      .filter((d) => this.hoverIds.includes(`tile-${d.id}`))
      .forEach((d) => (d.refreshActive = true));

    this.hoverIds = null;
  }

  tileElement(d) {
    const tile = htl.svg`<g id="tile-${d.id}" class="background-tile">
    <rect class="tile-rect" x=0 y=0 width=${this.tileSize} height=${
      this.tileSize
    } stroke="#121212" stroke-width=4 rx=10 />
    <text class="background-tile-text" x=${this.tileSize / 2} y=${
      this.tileSize / 2
    } alignment-baseline=middle text-anchor=middle font-family=Inconsolata stroke=white>${
      d.letter
    }</text>
    <rect x=0 y=0 width=${this.tileSize} height=${this.tileSize} opacity=0 />
    </g>`;

    d3.select(tile)
      .on("mouseover", () => {
        this.activateHover(d);
      })
      .on("mouseout", () => {
        this.deactivateHover();
      });

    return tile;
  }

  render() {
    const self = this;
    const svg = htl.svg`<svg class="welcome-background"></svg>`;

    d3.select(svg)
      .append("image")
      .attr("href", img.src) // Update with your actual GIF path
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("preserveAspectRatio", "xMidYMid slice")
      .attr("opacity", 0.8);

    // d3.select(svg)
    //   .append("rect")
    //   .attr("x", 0)
    //   .attr("y", 0)
    //   .attr("width", this.width)
    //   .attr("height", this.height)
    //   .attr("fill", "hsl(0, 0%, 12%)");

    // d3.select(svg)
    //   .append("g")
    //   .attr("pointer-events", "all")
    //   .selectAll("g")
    //   .data(this.data, (d) => d.id)
    //   .join(
    //     (enter) =>
    //       enter
    //         .append((d) => this.tileElement(d))
    //         .attr(
    //           "transform",
    //           (d) =>
    //             `translate(${d.x * this.tileSize - this.xOff},${
    //               d.y * this.tileSize - this.yOff
    //             })`
    //         )
    //         .attr("stroke-opacity", this.textOpacity.min),
    //     (update) => update,
    //     (exit) => exit.remove()
    //   );

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
