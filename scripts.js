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

  // define the chart dimensions and margins
  const screenWidth =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;
  const screenHeight =
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight;

  const margin = { top: 20, right: 20, bottom: 40, left: 60 };
  const width = screenWidth - margin.left - margin.right;
  const height = screenHeight - margin.top - margin.bottom;

  // define other variables
  const numBars = 10; // Number of bars to display at a time
  let index = 0; // Starting index for the data slice
  const duration = 1000; // Transition duration in milliseconds
  const years = Array.from(new Set(data.map((d) => d.Year))).sort();

  // render the initial chart
  const chartContainer = d3.select("#chart-container");
  const svg = chartContainer
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // create scales
  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.Global_Sales)])
    .range([margin.left, width - margin.right]);

  const yScale = d3
    .scaleBand()
    .domain(data.slice(0, numBars).map((d) => d.Name))
    .range([height - margin.bottom, margin.top])
    .padding(0.1);

  // create the initial bar chart
  let bars = svg
    .selectAll(".bar")
    .data(data.slice(0, numBars), (d) => d.Name)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", xScale(0))
    .attr("y", (d) => yScale(d.Name))
    .attr("width", (d) => xScale(d.Global_Sales) - xScale(0))
    .attr("height", yScale.bandwidth());

  // transition the bars
  function transition() {
    const currentYearData = data.filter((d) => d.Year === years[index]);

    // update the y-scale domain with the current data
    yScale.domain(currentYearData.map((d) => d.Name));

    bars = svg.selectAll(".bar").data(currentYearData, (d) => d.Name);

    // exit
    bars
      .exit()
      .transition()
      .duration(duration / 2)
      .attr("width", 0)
      .remove();

    // enter
    const enterBars = bars
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", xScale(0))
      .attr("y", (d) => yScale(d.Name))
      .attr("width", 0)
      .attr("height", yScale.bandwidth());

    // update
    bars = enterBars
      .merge(bars)
      .transition()
      .duration(duration)
      .attr("x", xScale(0))
      .attr("y", (d) => yScale(d.Name))
      .attr("width", (d) => xScale(d.Global_Sales) - xScale(0))
      .attr("height", yScale.bandwidth());

    index = (index + 1) % years.length;
  }

  // repeat the transition
  d3.interval(transition, duration * 2);

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

  // TODO: add axis labels, title, legend, etc.
});
