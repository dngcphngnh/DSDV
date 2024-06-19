d3.csv("https://raw.githubusercontent.com/dngcphngnh/DSDV/main/Data.csv").then(function(data) {
    // Group and summarize data
    let groupedData = Array.from(
        d3.rollup(data, v => v.length, d => d.Gender, d => d.StressLevel),
        ([Gender, sleepData]) => ({
            Gender,
            values: Array.from(sleepData, ([StressLevel, Count]) => ({ StressLevel: +StressLevel, Count }))
                .sort((a, b) => a.StressLevel - b.StressLevel) // Sort by SleepDuration
        })
    );

    console.log(groupedData); // Check the transformed data structure

    let width = 1000;
    let height = 600;
    let marginTop = 40;
    let marginRight = 10;
    let marginBottom = 60;
    let marginLeft = 150;

    let x = d3.scaleLinear()
        .domain([d3.min(groupedData, d => d3.min(d.values, v => v.StressLevel)),d3.max(groupedData, d => d3.max(d.values, v => v.StressLevel))]).nice()
        .range([marginLeft, width - marginRight]);

    let y = d3.scaleLinear()
        .domain([0, d3.max(groupedData, d => d3.max(d.values, v => v.Count))]).nice()
        .range([height - marginBottom, marginTop]);

    let svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height]);

    // Add the horizontal axis.
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x).ticks(8).tickSizeOuter(0))
        .call(g => g.selectAll("text").style("font-size", "12px"))
        .append("text")
        .attr("x", (width - marginLeft - marginRight) / 2 + marginLeft)
        .attr("y", marginBottom - 5)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .text("Age")
        .style("font-size", "20px")
        .text("Stress Level");

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
        .attr("x", -marginLeft - 150)
        .attr("y", marginTop - 3)
        .attr("fill", "black")
        .text("Mean Sleep Duration")
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .text("Number of People");

    // Create a color scale for the genders
    const color = d3.scaleOrdinal()
        .domain(groupedData.map(d => d.Gender))
        .range(["#3d606e", "#09191f"]);

    // Create a line generator function
    const line = d3.line()
        .x(d => x(d.StressLevel))
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

    // Add a tooltip element
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background", "#fff")
        .style("border", "1px solid #ccc")
        .style("padding", "5px");

    // Draw the scatter plot with interactions
    groupedData.forEach(genderGroup => {
        svg.selectAll(`.dot-${genderGroup.Gender}`)
            .data(genderGroup.values)
            .join("circle")
            .attr("class", `dot-${genderGroup.Gender}`)
            .attr("cx", d => x(d.StressLevel))
            .attr("cy", d => y(d.Count))
            .attr("r", 5)
            .attr("fill", color(genderGroup.Gender))
            .attr("stroke", "white")
            .attr("stroke-width", 1)
            .on("mouseover", function(event, d) {
                d3.select(this).attr("r", 7);
                tooltip.transition().duration(200).style("opacity", 1);
                tooltip.html(`Gender: ${genderGroup.Gender}<br>Stress Level: ${d.StressLevel}<br>Count: ${d.Count}`)
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

    // Add legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - marginRight - 150}, ${marginTop})`);

    groupedData.forEach((d, i) => {
        const legendRow = legend.append("g")
            .attr("transform", `translate(0, ${i * 40})`);

        legendRow.append("rect")
            .attr("width", 30)
            .attr("height", 30)
            .attr("fill", color(d.Gender));

        legendRow.append("text")
            .attr("x", 50)
            .attr("y", 20)
            .attr("text-anchor", "start")
            .attr("font-size", "16px")
            .text(d.Gender);
    });
}).catch(function(error) {
    console.log(error);
});
