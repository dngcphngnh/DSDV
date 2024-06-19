d3.csv("https://raw.githubusercontent.com/dngcphngnh/DSDV/main/Data.csv").then(function(data) {
    // Group and summarize data
    let groupedData = Array.from(
        d3.rollup(data, v => v.length, d => d.StressLevel),
        ([StressLevel, Count]) => ({
            StressLevel: +StressLevel,
            Count
        })
    ).sort((a, b) => a.StressLevel - b.StressLevel);

    console.log(groupedData); // Check the transformed data structure

    let width = 1000;
    let height = 500;
    let marginTop = 40;
    let marginRight = 10;
    let marginBottom = 60;
    let marginLeft = 150;

    const x = d3.scaleBand()
        .domain(groupedData.map(d => d.StressLevel))
        .range([marginLeft, width - marginRight])
        .padding(0.1);
  
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
        .attr("fill", "#3d606e")
        .selectAll("rect")
        .data(groupedData)
        .join("rect")
        .attr("x", d => x(d.StressLevel))
        .attr("y", d => y(d.Count))
        .attr("height", d => y(0) - y(d.Count))
        .attr("width", x.bandwidth())
        .on("mouseover", function(event, d) {
            d3.select(this).attr("fill", "#153b47");
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`Stress Level: ${d.StressLevel}<br>Count: ${d.Count}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("fill", "#3d606e");
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
        .attr("fill", "currentColor")
        .attr("text-anchor", "end")
        .text("Stress Level")
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
        .attr("x", -marginLeft - 140)
        .attr("y", marginTop - 3)
        .attr("fill", "currentColor")
        .attr("text-anchor", "middle")
        .text("Count")
        .style("font-size", "20px");

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
        .style("border", "1px solid #ccc")
        .style("pointer-events", "none")
        .style("opacity", 0);

}).catch(function(error) {
    console.log(error);
});
