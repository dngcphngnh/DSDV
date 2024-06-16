d3.csv("https://raw.githubusercontent.com/dngcphngnh/DSDV/main/Data.csv").then(function(data) {
    // Group and summarize data
    let groupedData = Array.from(
        d3.rollup(data, v => v.length, d => d.Age),
        ([Age, Count]) => ({
            Age: +Age,
            Count
        })
    ).sort((a, b) => a.StressLevel - b.StressLevel);

    console.log(groupedData); // Check the transformed data structure

    let width = 928;
    let height = 600;
    let marginTop = 40;
    let marginRight = 20;
    let marginBottom = 30;
    let marginLeft = 30;

    const x = d3.scaleBand()
        .domain(groupedData.map(d => d.Age))
        .range([marginLeft, width - marginRight])
        .padding(0.1);
  
    const y = d3.scaleLinear()
        .domain([0, d3.max(groupedData, d => d.Count)]).nice()
        .range([height - marginBottom, marginTop]);

    // Create the SVG container.
    const svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto;");

    // Add a rect for each bar.
    svg.append("g")
        .attr("fill", "steelblue")
        .selectAll("rect")
        .data(groupedData)
        .join("rect")
        .attr("x", d => x(d.Age))
        .attr("y", d => y(d.Count))
        .attr("height", d => y(0) - y(d.Count))
        .attr("width", x.bandwidth())
        .on("mouseover", function(event, d) {
            d3.select(this).attr("fill", "#03045e");
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`Age: ${d.Age}<br>Count: ${d.Count}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("fill", "steelblue");
            tooltip.transition().duration(200).style("opacity", 0);
        });

    // Add the x-axis and label.
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .append("text")
        .attr("x", width - marginRight)
        .attr("y", -4)
        .attr("fill", "currentColor")
        .attr("text-anchor", "end")
        .text("Stress Level");

    // Add the y-axis and label, and remove the domain line.
    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("x2", width - marginLeft - marginRight)
            .attr("stroke-opacity", 0.1))
        .append("text")
        .attr("x", -marginLeft)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text("↑ Count");

    // Create a tooltip div that is hidden by default
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("text-align", "center")
        .style("width", "120px")
        .style("height", "40px")
        .style("padding", "2px")
        .style("background", "white")
        .style("border", "0px")
        .style("border-radius", "8px")
        .style("pointer-events", "none")
        .style("opacity", 0);

}).catch(function(error) {
    console.log(error);
});
