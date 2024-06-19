d3.csv("https://raw.githubusercontent.com/dngcphngnh/DSDV/main/Data.csv").then(function(data) {
    // Convert the Count field to a number
    data.forEach(d => d.Count = +d.Count);

    // Group by Gender and sum the Counts
    let nestedData = d3.rollups(data, v => v.length, d => d.Gender)
                      .map(d => ({ Gender: d[0], Count: d[1] }));

    // Set up the chart dimensions
    let width = 1000;
    let height = Math.min(width, 500);

    // Create the color scale
    let color = d3.scaleOrdinal()
       .domain(nestedData.map(d => d.Gender))
       .range(["#30535f", "#09191f"]);

    // Create the pie layout and arc generator
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
      .style("width", "120px")
      .style("height", "35px")
      .style("padding", "5px")
      .style("font-size", "16px")
      .style("background", "white")
      .style("border", "1px solid #ccc")
      .style("pointer-events", "none")
      .style("opacity", 0);

    // Add a sector path for each value
    svg.append("g")
      .attr("stroke", "white")
      .selectAll("path")
      .data(pie(nestedData))
      .join("path")
      .attr("fill", d => color(d.data.Gender))
      .attr("d", arc)
      .on("mouseover", function(event, d) {
        d3.select(this).transition().duration(200).attr("transform", "scale(1.1)");
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(`Gender: ${d.data.Gender}<br>Count: ${d.data.Count}`)
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
      });

    // Add legend
    let legend = svg.append("g")
        .attr("transform", `translate(${width / 2 - 260},${-height / 2 + 50})`)
        .attr("font-size", 12)
        .attr("text-anchor", "start")
        .selectAll("g")
        .data(nestedData)
        .join("g")
        .attr("transform", (d, i) => `translate(0, ${i * 50})`);

    legend.append("rect")
        .attr("x", 30)
        .attr("width", 30)
        .attr("height", 30)
        .attr("fill", d => color(d.Gender));

    legend.append("text")
        .attr("x", 80)
        .attr("y", 14)
        .attr("dy", "0.35em")
        .attr("font-size", "20px")
        .text(d => d.Gender);

}).catch(function(error){
    console.log(error);
});
