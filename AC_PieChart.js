d3.csv("https://raw.githubusercontent.com/dngcphngnh/DSDV/main/Data.csv").then(function(data) {
  // Group data by SleepDisorder and count occurrences
  let groupedData = d3.rollups(
    data,
    v => v.length,
    d => d.SleepDisorder || "N/A" // Replace null values with "N/A"
  ).map(d => ({ SleepDisorder: d[0], Count: d[1] }));

  let width = 928;
  let height = Math.min(width, 500);

  let color = d3.scaleOrdinal()
    .domain(groupedData.map(d => d.SleepDisorder))
    .range(["#03045e", "#0077b6", "#00b4d8"]);

  let pie = d3.pie()
    .sort(null)
    .value(d => d.Count);

  let arc = d3.arc()
    .innerRadius(0)
    .outerRadius(Math.min(width, height) / 2 - 1);

  let labelRadius = Math.min(width, height) / 2 * 0.8;

  // A separate arc generator for labels
  let arcLabel = d3.arc()
    .innerRadius(labelRadius)
    .outerRadius(labelRadius);

  // Create SVG container
  let svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

  // Add a sector path for each value
  svg.append("g")
    .attr("stroke", "white")
    .selectAll("path")
    .data(pie(groupedData))
    .join("path")
    .attr("fill", d => color(d.data.SleepDisorder))
    .attr("d", arc)
    .append("title")
    .text(d => `${d.data.SleepDisorder}: ${d.data.Count}`);

  // Add labels
  svg.append("g")
    .attr("text-anchor", "middle")
    .selectAll("text")
    .data(pie(groupedData))
    .join("text")
    .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
    .call(text => text.append("tspan")
      .attr("y", "-0.4em")
      .attr("font-weight", "bold")
      .attr("fill","white")
      .text(d => d.data.SleepDisorder === "N/A" ? "None" : d.data.SleepDisorder)) // Show "N/A" instead of null
    .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25).append("tspan")
      .attr("x", 0)
      .attr("y", "0.7em")
      .attr("fill-opacity", 0.7)
      .attr("fill","white")
      .text(d => d.data.Count));

  
}).catch(function(error) {
  console.log(error);
});
