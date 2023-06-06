const data = [5, 6, 2, 8, 4, 9, 1];

d3.select("body")
  .selectAll("div")
  .data(data) // data
  .enter()
  .append("div") // creates div
  .text((d) => d.toFixed(2)) // changes content inside of div and adds 2 decimals (can use any variable, d is just most common)
  .style("padding", "1rem") // inline style
  .style("margin", "1px")
  .style("border-radius", "5px")
  .style("background-color", (d, i) => {
    const hue = (360 / data.length) * i;
    return `hsl(${hue}, 100%, 50%)`; // hsl = hue, saturation, lightness
    // return d > 5 ? "red" : "orange" // old code just for red and orange
  })
  .style("width", (d) => `${(d / 10) * 100}%`); // mapping function for width
