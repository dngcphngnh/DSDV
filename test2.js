d3.csv("Data.csv").then(function(data) {
    // Convert the Count field to a number
    data.forEach(d => d.Count = +d.Count);

    // Group by Gender and sum the Counts
    let nestedData = d3.rollups(data, v => v.length, d => d.Gender)
                      .map(d => ({ Gender: d[0], Count: d[1] }));

    // Set up the chart dimensions
    let width = 928;
    let height = Math.min(width, 500);

    // Create the color scale
    let color = d3.scaleOrdinal()
       .domain(nestedData.map(d => d.Gender))
       .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), nestedData.length).reverse());

    // Create the pie layout and arc generator
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
       .data(pie(nestedData))
       .join("path")
       .attr("fill", d => color(d.data.Gender))
       .attr("d", arc)
       .append("title")
       .text(d => `${d.data.Gender}: ${d.data.Count}`);

    // Add labels
    svg.append("g")
       .attr("text-anchor", "middle")
       .selectAll("text")
       .data(pie(nestedData))
       .join("text")
       .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
       .call(text => text.append("tspan")
           .attr("y", "-0.4em")
           .attr("font-weight", "bold")
           .text(d => d.data.Gender))
       .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25).append("tspan")
           .attr("x", 0)
           .attr("y", "0.7em")
           .attr("fill-opacity", 0.7)
           .text(d => d.data.Count));
}).catch(function(error){
    console.log(error);
});
