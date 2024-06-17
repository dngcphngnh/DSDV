d3.csv("https://raw.githubusercontent.com/dngcphngnh/DSDV/main/Data.csv").then(function(data) {
    // Group and summarize data
    let groupedData = Array.from(
        d3.rollup(data, v => v.length, d => d.SleepDisorder, d => d.Age),
        ([SleepDisorder, sleepData]) => ({
            SleepDisorder,
            values: Array.from(sleepData, ([Age, Count]) => ({ Age: +Age, Count }))
                .sort((a, b) => a.Age - b.Age) // Sort by Age
        })
    );

    console.log(groupedData); // Check the transformed data structure

    let width = 928;
    let height = 600;
    let marginTop = 40;
    let marginRight = 100; // Adjusted for legend space
    let marginBottom = 30;
    let marginLeft = 30;

    let x = d3.scaleLinear()
        .domain([
            d3.min(groupedData, d => d3.min(d.values, v => v.Age)),
            d3.max(groupedData, d => d3.max(d.values, v => v.Age))
        ]).nice()
        .range([marginLeft, width - marginRight]);

    let y = d3.scaleLinear()
        .domain([0, d3.max(groupedData, d => d3.max(d.values, v => v.Count))]).nice()
        .range([height - marginBottom, marginTop]);

    let svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; overflow: visible; font: 10px sans-serif;");

    // Add the title.
    svg.append("text")
        .attr("x", (width - marginLeft - marginRight) / 2 + marginLeft)
        .attr("y", marginTop - 10)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .text("Sleep Disorder vs Age");

    // Add the horizontal axis.
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x).ticks(8).tickSizeOuter(0))
        .append("text")
        .attr("x", width - marginRight)
        .attr("y", -6)
        .attr("fill", "currentColor")
        .attr("text-anchor", "end")
        .text("Age");

    // Add the vertical axis.
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
        .text("↑ Number of People");

    // Create a color scale for the sleep disorders
    const color = d3.scaleOrdinal()
        .domain(groupedData.map(d => d.SleepDisorder))
        .range(["#03045e", "#0077b6", "#00b4d8"]);

    // Add a tooltip element
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background", "#fff")
        .style("border", "1px solid #ccc")
        .style("padding", "5px")
        .style("border-radius", "5px");

    // Helper function to handle undefined values
    function formatValue(value) {
        return value === undefined ? "N/A" : value;
    }

    // Draw the scatter plot with interactions
    groupedData.forEach(d => {
        svg.selectAll(`.dot-${d.SleepDisorder}`)
            .data(d.values)
            .join("circle")
            .attr("class", `dot-${d.SleepDisorder}`)
            .attr("cx", v => x(v.Age))
            .attr("cy", v => y(v.Count))
            .attr("r", 5)
            .attr("fill", color(d.SleepDisorder))
            .attr("stroke", "white")
            .attr("stroke-width", 1)
            .on("mouseover", function(event, v) {
                d3.select(this).attr("r", 7);
                tooltip.transition().duration(200).style("opacity", 1);
                tooltip.html(`Sleep Disorder: ${formatValue(d.SleepDisorder)}<br>Age: ${formatValue(v.Age)}<br>Count: ${formatValue(v.Count)}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mousemove", function(event) {
                tooltip.style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                d3.select(this).attr("r", 5);
                tooltip.transition().duration(500).style("opacity", 0);
            });
    });

    // Create a line generator function
    const line = d3.line()
        .x(d => x(d.Age))
        .y(d => y(d.Count));

    // Draw the lines
    svg.selectAll(".line")
        .data(groupedData)
        .join("path")
        .attr("fill", "none")
        .attr("stroke", d => color(d.SleepDisorder))
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", d => line(d.values));

    // Add legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - marginRight + 10}, ${marginTop})`);

    groupedData.forEach((d, i) => {
        const legendRow = legend.append("g")
            .attr("transform", `translate(0, ${i * 20})`);

        legendRow.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", color(d.SleepDisorder));

        legendRow.append("text")
            .attr("x", 20)
            .attr("y", 10)
            .attr("text-anchor", "start")
            .attr("font-size", "12px")
            .text(d.SleepDisorder);
    });
}).catch(function(error) {
    console.log(error);
});
