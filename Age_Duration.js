d3.csv("https://raw.githubusercontent.com/dngcphngnh/DSDV/main/Data.csv").then(function(data) {
  // Process and group data
  let groupedData = Array.from(
      d3.group(data, d => d.Age),
      ([key, values]) => ({
          Age: +key,
          SleepDuration: +d3.mean(values, d => +d.SleepDuration).toFixed(2)
      })
  );

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

  // Define x scale as a band scale
  let x = d3.scaleBand()
      .domain(groupedData.map(d => d.Age))
      .range([marginLeft, width - marginRight])
      .padding(0.1);

  const xAxis = d3.axisBottom(x).tickSizeOuter(0);

  // Define y scale
  let y = d3.scaleLinear()
      .domain([0, d3.max(groupedData, d => d.SleepDuration)]).nice()
      .range([height - marginBottom, marginTop]);

  const yAxis = d3.axisLeft(y);

  // Create the SVG container.
  let svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

  // Add the bars
  svg.append("g")
      .attr("class", "bars")
      .attr("fill", "#298c8c")
      .selectAll("rect")
      .data(groupedData)
      .join("rect")
      .attr("x", d => x(d.Age))
      .attr("y", d => y(d.SleepDuration))
      .attr("height", d => y(0) - y(d.SleepDuration))
      .attr("width", 20)
      .on("mouseover", function(event, d) {
          d3.select(this).attr("fill", "#8b8b8b");
          tooltip.transition().duration(200).style("opacity", 1);
          tooltip.html(`Age: ${d.Age}<br>Mean Sleep Duration: ${d.SleepDuration}`)
              .style("left", (event.pageX + 5) + "px")
              .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
          d3.select(this).attr("fill", "#298c8c");
          tooltip.transition().duration(200).style("opacity", 0);
      });

  // Add the x-axis and label.
  svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(xAxis)
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
      .attr("class", "y-axis")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(yAxis)
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
      .text("Mean Sleep Duration")
      .attr("text-anchor", "middle")
      .style("font-size", "20px");

  // Create a tooltip div that is hidden by default
  const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("width", "100px")
      .style("height", "55px")
      .style("padding", "5px")
      .style("background", "white")
      .style("border", "1px solid #ccc")
      .style("pointer-events", "none")
      .style("opacity", 0);

  function zoom(svg) {
      const extent = [[marginLeft, marginTop], [width - marginRight, height - marginBottom]];

      svg.call(d3.zoom()
          .scaleExtent([1, 8])
          .translateExtent(extent)
          .extent(extent)
          .on("zoom", zoomed));

      function zoomed(event) {
          x.range([marginLeft, width - marginRight].map(d => event.transform.applyX(d)));
          svg.selectAll(".bars rect")
              .attr("x", d => x(d.Age))
              .attr("width", x.bandwidth());
          svg.selectAll(".x-axis").call(xAxis);
      }
  }

  svg.call(zoom);

}).catch(function(error) {
  console.log(error);
});
