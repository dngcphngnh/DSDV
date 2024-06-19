d3.csv("https://raw.githubusercontent.com/dngcphngnh/DSDV/main/Data.csv").then(function(data) {
  // Group and summarize data
  let groupedData = Array.from(
      d3.rollup(data, v => v.length, d => d.Age),
      ([Age, Count]) => ({
          Age: +Age,
          Count
      })
  )

  // Ensure there's an entry for Age 47 with count 0 if missing
if (!groupedData.some(d => d.Age === 46)) {
  groupedData.push({ Age: 46, Count: 0 });
}

// Ensure there's an entry for Age 47 with count 0 if missing
if (!groupedData.some(d => d.Age === 47)) {
  groupedData.push({ Age: 47, Count: 0 });
}

  groupedData.sort((a, b) => a.Age - b.Age);

  let width = 1000;
  let height = 500;
  let marginTop = 40;
  let marginRight = 10;
  let marginBottom = 60;
  let marginLeft = 150;

  const x = d3.scaleBand()
      .domain(groupedData.map(d => d.Age))
      .range([marginLeft, width - marginRight]);


  const y = d3.scaleLinear()
      .domain([0, d3.max(groupedData, d => d.Count)]).nice()
      .range([height - marginBottom, marginTop]);


  // Create the SVG container.
  const svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

  // Add a rect for each bar.
  svg.append("g")
      .attr("fill", "#298c8c")
      .selectAll("rect")
      .data(groupedData)
      .join("rect")
      .attr("x", d => x(d.Age))
      .attr("y", d => y(d.Count))
      .attr("height", d => y(0) - y(d.Count))
      .attr("width", 20)
      .on("mouseover", function(event, d) {
          d3.select(this).attr("fill", "#b8b8b8");
          tooltip.transition().duration(200).style("opacity", 1);
          tooltip.html(`Age: ${d.Age}<br>Count: ${d.Count}`)
              .style("left", (event.pageX + 5) + "px")
              .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
          d3.select(this).attr("fill", "#298c8c");
          tooltip.transition().duration(200).style("opacity", 0);
      });

  // Add the x-axis and label.
  svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .call(g => g.selectAll("text").style("font-size", "12px"))
      .append("text")
      .attr("x", (width - marginLeft - marginRight) / 2 + marginLeft)
      .attr("y", marginBottom - 5)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text("Age")
      .style("font-size", "20px");

  // Add the y-axis and label, and remove the domain line.
  svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").clone()
          .attr("x2", width - marginLeft - marginRight)
          .attr("stroke-opacity", 0.1))
      .call(g => g.selectAll("text").style("font-size", "12px"))
      .append("text")
      .attr("transform", `rotate(-90, -${marginLeft / 2}, ${marginTop - 10})`)
      .attr("x", -marginLeft - 130)
      .attr("y", marginTop - 3)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .text("Count")
      .style("font-size", "20px");

  // Create a tooltip div that is hidden by default
  const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("width", "70px")
  .style("height", "35px")
  .style("padding", "5px")
  .style("background", "white")
  .style("border", "1px solid #ccc")
  .style("pointer-events", "none")
  .style("opacity", 0);

});
