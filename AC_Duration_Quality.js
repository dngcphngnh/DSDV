d3.csv("https://raw.githubusercontent.com/dngcphngnh/DSDV/main/Data.csv").then(function(data) {
    // Process and group data
    let groupedData = Array.from(
        d3.group(data, d => d.SleepDuration),
        ([key, values]) => ({
            SleepDuration: +key,
            QualityofSleep: d3.mean(values, d => +d.QualityofSleep)
        })
    );

    groupedData.sort((a, b) => a.SleepDuration - b.SleepDuration);

    let width = 1000;
    let height = 600;
    let marginTop = 40;
    let marginRight = 10;
    let marginBottom = 60;
    let marginLeft = 150;

    // Define x scale
    let x = d3.scaleLinear()
        .domain([d3.min(groupedData, d => d.SleepDuration), d3.max(groupedData, d => d.SleepDuration)])
        .range([marginLeft, width - marginRight]);

    // Define y scale
    let y = d3.scaleLinear()
        .domain([d3.min(groupedData, d => d.QualityofSleep), d3.max(groupedData, d => d.QualityofSleep)])
        .range([height - marginBottom, marginTop]);

    // Create the SVG container.
    let svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height]);

    // Add the horizontal axis.
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .call(g => g.selectAll("text").style("font-size", "12px"))
        .append("text")
        .attr("x", (width - marginLeft - marginRight) / 2 + marginLeft)
        .attr("y", marginBottom - 5)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .text("Sleep Quality")
        .style("font-size", "20px");


    // Add the vertical axis.
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
        .attr("x", -marginLeft - 200)
        .attr("y", marginTop - 3)
        .attr("fill", "black")
        .text("Mean Sleep Duration")
        .attr("text-anchor", "middle")
        .style("font-size", "20px");

    // Define the line generator
    let line = d3.line()
        .x(d => x(d.SleepDuration))
        .y(d => y(d.QualityofSleep));

    // Add the line path
    svg.append("path")
        .datum(groupedData)
        .attr("fill", "none")
        .attr("stroke", "#3d606e")
        .attr("stroke-width", 1.5)
        .attr("d", line);

    // Add a tooltip element
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("text-align", "center")
        .style("width", "120px")
        .style("height", "55px")
        .style("padding", "0px")
        .style("font-size", "16px")
        .style("background", "white")
        .style("border", "0px")
        .style("pointer-events", "none")
        .style("opacity", 0);

    // Add the scatter plot points with interactivity.
    svg.selectAll("circle")
        .data(groupedData)
        .join("circle")
        .attr("cx", d => x(d.SleepDuration))
        .attr("cy", d => y(d.QualityofSleep))
        .attr("r", 5)
        .attr("fill", "#3d606e")
        .on("mouseover", function(event, d) {
            d3.select(this).attr("r", 7).attr("fill", "#153b47");
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`Quality of Sleep: ${d.QualityofSleep.toFixed(2)}<br>Sleep Duration: ${d.SleepDuration}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("r", 5).attr("fill", "#3d606e");
            tooltip.transition().duration(200).style("opacity", 0);
        });

}).catch(function(error) {
    console.log(error);
});
