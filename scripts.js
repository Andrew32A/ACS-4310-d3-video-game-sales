// *****************************************************************************************
// i really need to componentize this code, it's a mess
// to anyone looking at this, i apologize lol
// *****************************************************************************************

// define the chart dimensions and margins
let screenWidth =
  window.innerWidth ||
  document.documentElement.clientWidth ||
  document.body.clientWidth;
let screenHeight =
  window.innerHeight ||
  document.documentElement.clientHeight ||
  document.body.clientHeight;

let margin = { top: 20, right: 20, bottom: 40, left: 150 };
let width = screenWidth - margin.left - margin.right;
let height = screenHeight - margin.top - margin.bottom;

// add an event listener to the window to resize the chart and reload page
window.addEventListener("resize", function () {
  location.reload();
});

// 31 consoles
consoleColors = {
  Wii: "#4B0082",
  NES: "#9999FF",
  GB: "#99FF99",
  DS: "#FFFF99",
  X360: "#FFB366",
  PS3: "#CC99FF",
  PS2: "#FF99FF",
  SNES: "#996633",
  GBA: "#CCCCCC",
  "3DS": "#66FFFF",
  PS4: "#FF66FF",
  N64: "#33CCCC",
  PS: "#99FF33",
  XB: "#808000",
  PC: "#000080",
  2600: "#800000",
  PSP: "#00FFFF",
  XOne: "#C0C0C0",
  GC: "#FFD700",
  WiiU: "#FF9999",
  GEN: "#FF7F50",
  DC: "#E6E6FA",
  PSV: "#D2B48C",
  SAT: "#FA8072",
  SCD: "#EE82EE",
  WS: "#F5F5DC",
  NG: "#F0E68C",
  TG16: "#40E0D0",
  "3DO": "#DA70D6",
  GG: "#CD853F",
  PCFX: "#DDA0DD",
};

// create a tooltip
const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

const tooltipSelector = document.querySelector(".tooltip");

// add event listener to track mouse movement
document.addEventListener("mousemove", (e) => {
  // update the tooltip position based on the cursor's coordinates
  tooltip.style("left", e.pageX + "px").style("top", e.pageY + "px");
});

function getConsoleColor(consoleName) {
  return consoleColors[consoleName] || "gray";
}

d3.csv("./data/vgsales.csv").then(function (data) {
  // convert sales values to numbers
  data.forEach(function (d) {
    d.NA_Sales = +d.NA_Sales;
    d.EU_Sales = +d.EU_Sales;
    d.JP_Sales = +d.JP_Sales;
    d.Other_Sales = +d.Other_Sales;
    d.Global_Sales = +d.Global_Sales;
  });

  // sort the data by Global_Sales in descending order
  data.sort(function (a, b) {
    return b.Global_Sales - a.Global_Sales;
  });

  // define other variables
  const numBars = 10; // number of bars to display at a time
  let index = 0; // starting index for the data slice
  const duration = 2000; // transition duration in milliseconds
  const years = Array.from(new Set(data.map((d) => d.Year))).sort();

  // render the initial chart
  const chartContainer = d3.select("#chart-container");
  const svg = chartContainer
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // create scales
  let xScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.Global_Sales)])
    .range([margin.left, width - margin.right]);

  const yScale = d3
    .scaleBand()
    .range([height - margin.bottom, margin.top])
    .padding(0.2);

  // create the initial bar chart
  let bars = svg
    .selectAll(".bar")
    .data(data.slice(0, numBars), (d) => d.Name)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", 0)
    .attr("y", (d) => 0)
    .attr("width", (d) => 0)
    .attr("height", yScale.bandwidth());

  // add a text element for displaying the current year
  const yearText = svg
    .append("text")
    .attr("class", "year-text")
    .attr("x", width / 2)
    .attr("y", margin.top - 5) // adjust the position as desired
    .attr("text-anchor", "middle")
    .text("");

  // transition the bars
  function transition() {
    const currentYearData = data.filter((d) => d.Year <= years[index]);

    // sort the current year data by Global_Sales in descending order
    currentYearData.sort(function (a, b) {
      return b.Global_Sales - a.Global_Sales;
    });

    // cap the data to the top 10 bars
    const top10Data = currentYearData.slice(0, 10);

    // update the y-scale domain with the current data (reversed order)
    yScale.domain(top10Data.map((d) => d.Name).reverse());

    // update the x-scale domain with the max sales of the current top game
    const maxSales = top10Data[0].Global_Sales;

    // clear x-axis
    svg.selectAll(".x-axis").remove();

    // updates xScale
    xScale = d3
      .scaleLinear()
      .domain([0, maxSales * 1.1])
      .range([margin.left, width - margin.right]);

    // displays xScale
    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(${0}, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));

    // update the y-axis
    svg
      .select(".y-axis")
      .transition()
      .duration(duration)
      .call(d3.axisLeft(yScale));

    bars = svg.selectAll(".bar").data(top10Data, (d) => d.Name);

    // exit
    bars
      .exit()
      .transition()
      .duration(duration / 2)
      .attr("width", 0)
      .remove();

    // mouse over for tooltips
    function handleMouseOver(i, d) {
      console.log(event.pageX, event.pageY);
      // change color of bar
      d3.select(this).attr("fill", "white");
      // show the tooltip window
      tooltip.style("opacity", 1);

      // position the tooltip window relative to the mouse
      const [x, y] = d3.pointer(d);
      tooltip.style("left", x + 10 + "px").style("top", y + "px");

      // set the content of the tooltip window based on the data
      tooltip
        .html(
          `<strong>${d.Name}</strong><br>
          Platform: ${d.Platform}<br>
          Year: ${d.Year}<br>
          Genre: ${d.Genre}<br>
          Global Sales: $${d.Global_Sales} million`
        )
        // TODO: this isn't working properly, going to try creating an event listener tied to the tooltip to always update position
        // .style("left", `${event.pageX + 10}px`) // update the tooltip's left position
        // .style("top", `${event.pageY}px`) // update the tooltip's top position
        .style("opacity", 0.9);
    }

    // mouse out for tooltips
    function handleMouseOut(d, i) {
      d3.select(this).attr("fill", (d) => getConsoleColor(d.Platform));
      tooltip.style("opacity", 0);
    }

    // enter
    const enterBars = bars.enter().append("g").attr("class", "bar");

    enterBars
      .append("rect")
      .attr("x", xScale(0))
      .attr("y", (d) => yScale(d.Name))
      .attr("width", 0)
      .attr("height", yScale.bandwidth())
      .attr("fill", (d) => getConsoleColor(d.Platform)) // set the console color for the bar
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut);

    enterBars
      .append("text")
      .attr("class", "bar-label")
      .attr("x", (d) => xScale(d.Global_Sales) / 2) // made the text slowly move to the right, adjust if needed!
      .attr("y", (d) => yScale(d.Name) + yScale.bandwidth() / 2)
      .text((d) => d.Name);

    // update
    bars = enterBars.merge(bars).transition().duration(duration);

    bars
      .select("rect")
      .attr("x", xScale(0))
      .attr("y", (d) => yScale(d.Name))
      .attr("width", (d) => xScale(d.Global_Sales) - xScale(0))
      .attr("height", yScale.bandwidth())
      .attr("fill", (d) => getConsoleColor(d.Platform)); // set the console color for the bar

    bars
      .select(".bar-label")
      .attr("x", (d) => xScale(d.Global_Sales) + 5)
      .attr("y", (d) => yScale(d.Name) + yScale.bandwidth() / 2)
      .text((d) => `$${d.Global_Sales} Million`);

    // update the year text
    yearText.text(years[index]);

    index++;
    if (index >= years.length) {
      // reached the end of years, stop the transition
      index = years.length - 1;
    }
  }

  // create a button to trigger the transition
  const button = chartContainer
    .append("button")
    .attr("class", "next-button")
    .text("Next Year")
    .on("click", transition);

  // add labels and other elements
  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(xScale));

  svg
    .append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(yScale));

  // legend
  const legendContainer = chartContainer
    .append("div")
    .attr("class", "legend-container");

  const legendWidth = (width - margin.left - margin.right) / 2;
  const legend = legendContainer
    .append("svg")
    .attr("width", legendWidth)
    .attr("height", 40)
    .attr("class", "legend");

  const legendItems = legend
    .selectAll(".legend-item")
    .data(Object.entries(consoleColors))
    .enter()
    .append("g")
    .attr("class", "legend-item")
    .attr("transform", (d, i) => `translate(${i * 80}, 0)`);

  legendItems
    .append("rect")
    .attr("x", 0)
    .attr("y", 10)
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", (d) => d[1]);

  legendItems
    .append("text")
    .attr("x", 30)
    .attr("y", 20)
    .text((d) => d[0]);

  // Calculate the number of items that fit in a row
  const itemsPerRow = Math.floor(legendWidth / 80);

  // Wrap legend items to a new row if needed
  legendItems.attr(
    "transform",
    (d, i) =>
      `translate(${(i % itemsPerRow) * 80}, ${
        Math.floor(i / itemsPerRow) * 30
      })`
  );

  legendContainer.style(
    "height",
    `${Math.ceil(Object.keys(consoleColors).length / itemsPerRow) * 30}px`
  );

  // initial transition
  transition();
});
