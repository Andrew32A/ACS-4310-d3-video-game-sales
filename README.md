# Top 10 Video Game Sales

A bar chart race that displays the top 10 cumulative video game sales data! This is my first project using D3 for data visualization. It was quite a challenge, but I learned a lot and had fun along the way!

<h2 align="center"><a href="https://andrew32a.github.io/ACS-4310-d3-video-game-sales/">Click here to try it out!</a></h3>

<img src="https://github.com/Andrew32A/ACS-4310-d3-video-game-sales/blob/main/images/screenshot1.png" align="center">
<img src="https://github.com/Andrew32A/ACS-4310-d3-video-game-sales/blob/main/images/screenshot2.png" align="center">

## Code Structure

The code is written in JavaScript and uses D3.js for data manipulation and visualization. Here's an overview of the code structure:

1. **Chart Dimensions and Margins**: The chart's dimensions and margins are defined based on the available screen size.
2. **Window Resize Event**: An event listener is added to the window to resize the chart and reload the page when the window size changes.
3. **Console Colors**: An object `consoleColors` is defined, mapping console names to their respective color codes.
4. **Tooltip**: A tooltip element is created and positioned based on the mouse movement. The tooltip provides information about each bar in the chart.
5. **Data Loading**: The CSV data file is loaded using D3's `d3.csv` function. Sales values are converted to numbers.
6. **Chart Initialization**: The initial chart is rendered with an empty dataset. Scales and axes are created.
7. **Transition Function**: The `transition` function handles the chart transition for each year of data. It updates the scales, axes, and bars accordingly.
8. **Mouse Events**: Event handlers are defined for mouseover and mouseout events on the bars. They change the bar color and display the tooltip.
9. **Next Year Button**: A button is created to trigger the transition to the next year's data.
10. **Legend**: A legend is added to display the colors and names of the game consoles represented in the chart.

## Usage

To use this code with your own data, follow these steps:

1. Prepare your CSV data file with the required columns: `Name`, `Platform`, `Year`, `Genre`, `Global_Sales`, `NA_Sales`, `EU_Sales`, `JP_Sales`, `Other_Sales`.
2. Update the file path in the `d3.csv` function call to point to your data file.
3. Modify the code as needed to adapt to your data structure and requirements. You can customize the chart dimensions, margins, colors, and other elements.

## Additional Notes

- The code assumes that the CSV data file is sorted by year in ascending order.
- The chart displays the top 10 games by global sales for each year. You can change the `numBars` variable to adjust the number of bars displayed.
- The chart automatically transitions to the next year's data when the "Next Year" button is clicked.
- The legend provides a color code and name for each game console. You can customize the legend to fit your specific console list.
