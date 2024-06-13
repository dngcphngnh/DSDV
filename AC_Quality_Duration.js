d3.csv("https://raw.githubusercontent.com/dngcphngnh/DSDV/main/Data.csv").then(function(data) {
    // Process and group data
    let groupedData = Array.from(
        d3.group(data, d => d.SleepDuration),
        ([key, values]) => ({
            SleepDuration: +key,
            QualityofSleep: d3.mean(values, d => +d.QualityofSleep)
        })
    );

    let width = 928;
    let height = 600;
    let marginTop = 20;
    let marginRight = 20;
    let marginBottom = 30;
    let marginLeft = 30;

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
            .text("Sleep Duration"));

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
            .text("↑ Quality of Sleep"));

    // Add the scatter plot points with interactivity.
    svg.selectAll("circle")
        .data(groupedData)
        .join("circle")
        .attr("cx", d => x(d.SleepDuration))
        .attr("cy", d => y(d.QualityofSleep))
        .attr("r", 5)
        .attr("fill", "steelblue")
        .on("mouseover", function(event, d) {
            d3.select(this)
                .attr("r", 6)
                .attr("fill", "orange");

            svg.append("text")
                .attr("id", "tooltip")
                .attr("x", x(d.SleepDuration) + 5)
                .attr("y", y(d.QualityofSleep) - 5)
                .text(`Sleep Duration: ${d.SleepDuration}, Quality: ${d.QualityofSleep.toFixed(2)}`);
        })
        .on("mouseout", function(d) {
            d3.select(this)
                .attr("r", 5)
                .attr("fill", "steelblue");

            svg.select("#tooltip").remove();
        });

}).catch(function(error) {
    console.log(error);
});
