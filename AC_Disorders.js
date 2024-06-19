d3.csv("https://raw.githubusercontent.com/dngcphngnh/DSDV/main/Data.csv").then(function(data) {
    // Group data by SleepDisorder and count occurrences
    let groupedData = d3.rollups(
      data,
      v => v.length,
      d => d.SleepDisorder || "N/A" // Replace null values with "N/A"
    ).map(d => ({ SleepDisorder: d[0], Count: d[1] }));
  
    let width = 1000;
    let height = Math.min(width, 700);

    let color = d3.scaleOrdinal()
      .domain(groupedData.map(d => d.SleepDisorder))
      .range(["#30535f", "#1f3b4d", "#09191f"]);
  
    let pie = d3.pie()
      .sort(null)
      .value(d => d.Count);
  
    let arc = d3.arc()
      .innerRadius(0)
      .outerRadius(Math.min(width, 450) / 2 - 1);
  
    let labelRadius = Math.min(width, height) / 2 * 0.8;
  
    // A separate arc generator for labels
    let arcLabel = d3.arc()
      .innerRadius(labelRadius)
      .outerRadius(labelRadius);
  
    // Create SVG container
    let svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-width / 2, -height / 2, width, height]);
  
    // Create tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
        .style("text-align", "center")
        .style("width", "120px")
        .style("height", "38px")
        .style("padding", "0px")
        .style("font-size", "16px")
        .style("background", "white")
        .style("border", "0px")
        .style("pointer-events", "none")
        .style("opacity", 0);
  
    // Add a sector path for each value
    svg.append("g")
      .attr("stroke", "white")
      .selectAll("path")
      .data(pie(groupedData))
      .join("path")
      .attr("fill", d => color(d.data.SleepDisorder))
      .attr("d", arc)
      .on("mouseover", function(event, d) {
        d3.select(this).transition().duration(200).attr("transform", "scale(1.1)");
        const percentage = ((d.data.Count / d3.sum(groupedData, d => d.Count)) * 100).toFixed(2);
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(`${d.data.SleepDisorder}: ${d.data.Count} (${percentage}%)`)
          .style("left", `${event.pageX + 5}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mousemove", function(event) {
        tooltip.style("left", `${event.pageX + 5}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mouseout", function() {
        d3.select(this).transition().duration(200).attr("transform", "scale(1)");
        tooltip.transition().duration(200).style("opacity", 0);
      })
      .append("title")
      .text(d => `${d.data.SleepDisorder}: ${d.data.Count}`);
  

    // Add legend
    let legend = svg.append("g")
    .attr("transform", `translate(${width / 2 - 300},${-height / 2 + 50})`)
    .attr("font-size", 12)
    .attr("text-anchor", "start")
    .selectAll("g")
    .data(groupedData)
    .join("g")
    .attr("transform", (d, i) => `translate(0, ${i * 50})`);

legend.append("rect")
    .attr("x", 30)
    .attr("width", 30)
    .attr("height", 30)
    .attr("fill", d => color(d.SleepDisorder));

legend.append("text")
    .attr("x", 80)
    .attr("y", 14)
    .attr("dy", "0.35em")
    .attr("fill", d => color(d.SleepDisorder))
    .attr("font-size", "20px")
    .text(d => d.SleepDisorder === "N/A" ? "None" : d.SleepDisorder);
  
  }).catch(function(error) {
    console.log(error);
  });
