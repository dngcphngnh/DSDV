d3.csv("https://raw.githubusercontent.com/dngcphngnh/DSDV/main/Data.csv").then(function(data) {
    // Group and summarize data
    let groupedData = Array.from(
        d3.rollup(data, v => v.length, d => d.Gender, d => d.SleepDuration),
        ([Gender, sleepData]) => ({
            Gender,
            values: Array.from(sleepData, ([SleepDuration, Count]) => ({ SleepDuration: +SleepDuration, Count }))
                .sort((a, b) => a.SleepDuration - b.SleepDuration) // Sort by SleepDuration
        })
    );

    console.log(groupedData); // Check the transformed data structure

    let width = 928;
    let height = 600;
    let marginTop = 20;
    let marginRight = 20;
    let marginBottom = 30;
    let marginLeft = 30;

    let x = d3.scaleLinear()
        .domain([
            d3.min(groupedData, d => d3.min(d.values, v => v.SleepDuration)),
            d3.max(groupedData, d => d3.max(d.values, v => v.SleepDuration))
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

    // Add the horizontal axis.
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x).ticks(8).tickSizeOuter(0))
        .append("text")
        .attr("x", width - marginRight)
        .attr("y", -6)
        .attr("fill", "currentColor")
        .attr("text-anchor", "end")
        .text("Sleep Duration");

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

    // Create a color scale for the genders
    const color = d3.scaleOrdinal()
        .domain(groupedData.map(d => d.Gender))
        .range(["#03045e", "#00b4d8"]);

    // Create a line generator function
    const line = d3.line()
        .x(d => x(d.SleepDuration))
        .y(d => y(d.Count));

    // Draw the lines
    svg.selectAll(".line")
        .data(groupedData)
        .join("path")
        .attr("fill", "none")
        .attr("stroke", d => color(d.Gender))
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", d => line(d.values));

    // Draw the scatter plot
    groupedData.forEach(genderGroup => {
        svg.selectAll(`.dot-${genderGroup.Gender}`)
            .data(genderGroup.values)
            .join("circle")
            .attr("class", `dot-${genderGroup.Gender}`)
            .attr("cx", d => x(d.SleepDuration))
            .attr("cy", d => y(d.Count))
            .attr("r", 5)
            .attr("fill", color(genderGroup.Gender))
            .attr("stroke", "white")
            .attr("stroke-width", 1);

    // Add a tooltip element
    const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip");

// Draw the scatter plot with interactions
groupedData.forEach(genderGroup => {
    svg.selectAll(`.dot-${genderGroup.Gender}`)
        .data(genderGroup.values)
        .join("circle")
        .attr("class", `dot-${genderGroup.Gender}`)
        .attr("cx", d => x(d.SleepDuration))
        .attr("cy", d => y(d.Count))
        .attr("r", 5)
        .attr("fill", color(genderGroup.Gender))
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("r", 7);
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`Gender: ${genderGroup.Gender}<br>Sleep Duration: ${d.SleepDuration}<br>Count: ${d.Count}`)
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
}).catch(function(error) {
    console.log(error);
})
})
});

/*<style>
.tooltip {
    position: absolute;
    text-align: center;
    width: 100px;
    height: auto;
    padding: 5px;
    font: 12px sans-serif;
    background: lightsteelblue;
    border: 1px solid gray;
    border-radius: 8px;
    pointer-events: none;
    opacity: 0;
}
</style>
*/