d3.csv("https://raw.githubusercontent.com/dngcphngnh/DSDV/main/Data.csv").then(function(data) {
    // Convert Count values to numbers and extract StressLevel and Gender
    data.forEach(d => {
        d.Count = +d.Count; // Assuming there's a Count field that needs conversion
    });

    // Group and summarize data by StressLevel and Gender
    let groupedData = Array.from(
        d3.rollups(data, v => v.length, d => d.StressLevel, d => d.Gender),
        ([StressLevel, Genders]) => ({
            StressLevel,
            Genders: Genders.map(([Gender, Count]) => ({ Gender, Count }))
        })
    );

    console.log(groupedData); // Check the transformed data structure

    groupedData.sort((a, b) => a.StressLevel - b.StressLevel);

    // Specify the chart’s dimensions.
    let width = 1000;
    let height = 500;
    let marginTop = 40;
    let marginRight = 10;
    let marginBottom = 60;
    let marginLeft = 150;

    // Declare the x (horizontal position) scale and the corresponding axis generator.
    let x0 = d3.scaleBand()
        .domain(groupedData.map(d => d.StressLevel))
        .range([marginLeft, width - marginRight])
        .padding(0.1);

    let x1 = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Gender))])
        .range([0, x0.bandwidth()])
        .padding(0.05);

    let xAxis = d3.axisBottom(x0).tickSizeOuter(0);

    // Declare the y (vertical position) scale.
    let y = d3.scaleLinear()
        .domain([0, d3.max(groupedData, d => d3.max(d.Genders, s => s.Count))])
        .nice()
        .range([height - marginBottom, marginTop]);

    // Define a color scale
    let color = d3.scaleOrdinal()
        .domain([...new Set(data.map(d => d.Gender))])
        .range(["#298c8c", "#a00000"]);

    // Create the SVG container.
    let svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height]);

    // Create a tooltip div that is hidden by default
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("width", "110px")
        .style("height", "35px")
        .style("padding", "5px")
        .style("background", "white")
        .style("border", "1px solid #ccc")
        .style("pointer-events", "none")
        .style("opacity", 0);

    // Create a group for each StressLevel and then create a bar for each Gender within that group.
    svg.append("g")
        .selectAll("g")
        .data(groupedData)
        .join("g")
        .attr("transform", d => `translate(${x0(d.StressLevel)},0)`)
        .selectAll("rect")
        .data(d => d.Genders)
        .join("rect")
        .attr("x", d => x1(d.Gender))
        .attr("y", d => y(d.Count))
        .attr("height", d => y(0) - y(d.Count))
        .attr("width", x1.bandwidth())
        .attr("fill", d => color(d.Gender))
        .on("mouseover", function(event, d) {
            d3.select(this).attr("fill", "#b8b8b8");
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`Gender: ${d.Gender}<br>Count: ${d.Count}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("fill", d => color(d.Gender));
            tooltip.transition().duration(200).style("opacity", 0);
        });

    // Create the axes.
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(xAxis)
        .call(g => g.selectAll("text").style("font-size", "12px"))
        .append("text")
        .attr("x", (width - marginLeft - marginRight) / 2 + marginLeft)
        .attr("y", marginBottom - 5)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .text("Stress Levels")
        .style("font-size", "20px");

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
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .text("Number of People")
        .style("font-size", "20px");

    // Create the legend.
    const legend = svg.append("g")
        .attr("transform", `translate(${width - marginRight - 210}, ${marginTop})`);

    const genders = [...new Set(data.map(d => d.Gender))];
    genders.forEach((gender, i) => {
        const legendRow = legend.append("g")
            .attr("transform", `translate(0, ${i * 50})`);

        legendRow.append("rect")
            .attr("width", 30)
            .attr("height", 30)
            .attr("fill", color(gender));

        legendRow.append("text")
            .attr("x", 40)
            .attr("y", 15)
            .attr("dy", "0.32em")
            .attr("text-anchor", "start")
            .style("font-size", "18px")
            .text(gender);
    });

})
.catch(function(error) {
    console.log(error);
});
