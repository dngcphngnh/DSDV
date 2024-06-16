d3.csv("https://raw.githubusercontent.com/dngcphngnh/DSDV/main/Data.csv").then(function(data) {
    // Process and group data
    let groupedData = Array.from(
        d3.group(data, d => d.StressLevel),
        ([key, values]) => ({
            StressLevel: +key,
            QualityofSleep: d3.mean(values, d => +d.QualityofSleep)
        })
    );

    // Sort data by StressLevel
    groupedData.sort((a, b) => a.StressLevel - b.StressLevel);

    let width = 928;
    let height = 600;
    let marginTop = 20;
    let marginRight = 20;
    let marginBottom = 30;
    let marginLeft = 30;

    // Define x scale
    let x = d3.scaleLinear()
        .domain([d3.min(groupedData, d => d.StressLevel), d3.max(groupedData, d => d.StressLevel)]).nice()
        .range([marginLeft, width - marginRight]);

    // Define y scale
    let y = d3.scaleLinear()
        .domain([d3.min(groupedData, d => d.QualityofSleep), d3.max(groupedData, d => d.QualityofSleep)])
        .range([height - marginBottom, marginTop]);

    // Create the SVG container.
    let svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; overflow: visible; font: 10px sans-serif;");

    // Add the horizontal axis.
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x).ticks(8).tickSizeOuter(0))
        .call(g => g.append("text")
            .attr("x", width - marginRight)
            .attr("y", -4)
            .attr("fill", "currentColor")
            .attr("text-anchor", "end")
            .text("Stress Level"));

    // Add the vertical axis.
    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("x2", width - marginLeft - marginRight)
            .attr("stroke-opacity", 0.1))
        .call(g => g.append("text")
            .attr("x", -marginLeft)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text("↑ Mean Quality of Sleep"));

    // Define the line generator
    let line = d3.line()
        .x(d => x(d.StressLevel))
        .y(d => y(d.QualityofSleep));

    // Add the line path
    svg.append("path")
        .datum(groupedData)
        .attr("fill", "none")
        .attr("stroke", "#00b4d8")
        .attr("stroke-width", 1.5)
        .attr("d", line);

    // Add a tooltip element
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "white")
        .style("padding", "5px")
        .style("border", "1px solid black")
        .style("border-radius", "5px")
        .style("pointer-events", "none")
        .style("opacity", 0);

    // Add the scatter plot points with interactivity.
    svg.selectAll("circle")
        .data(groupedData)
        .join("circle")
        .attr("cx", d => x(d.StressLevel))
        .attr("cy", d => y(d.QualityofSleep))
        .attr("r", 5)
        .attr("fill", "#00b4d8")
        .on("mouseover", function(event, d) {
            d3.select(this).attr("r", 7).attr("fill", "#03045e");
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`Quality of Sleep: ${d.QualityofSleep.toFixed(2)}<br>Stress Level: ${d.StressLevel}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("r", 5).attr("fill", "#00b4d8");
            tooltip.transition().duration(200).style("opacity", 0);
        });

}).catch(function(error) {
    console.log(error);
});
