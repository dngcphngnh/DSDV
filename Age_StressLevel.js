d3.csv("https://raw.githubusercontent.com/dngcphngnh/DSDV/main/Data.csv").then(function(data) {
    // Calculate mean stress level for each age group
    let ageStressData = Array.from(
        d3.rollup(
            data,
            v => {
                const meanStressLevel = d3.mean(v, d => +d.StressLevel).toFixed(2);
                return meanStressLevel;
            },
            d => d.Age
        ),
        ([Age, MeanStressLevel]) => ({
            Age: +Age,
            MeanStressLevel: MeanStressLevel
        })
    );


    if (!ageStressData.some(d => d.Age === 46)) {
        ageStressData.push({ Age: 46, Count: 0 });
    }
    
    // Ensure there's an entry for Age 47 with count 0 if missing
    if (!ageStressData.some(d => d.Age === 47)) {
        ageStressData.push({ Age: 47, Count: 0 });
    }

    ageStressData.sort((a, b) => a.Age - b.Age);

    // Specify the chart’s dimensions.
    const width = 1000;
    const height = 500;
    const marginTop = 40;
    const marginRight = 10;
    const marginBottom = 60; // Increased to accommodate the x-axis title
    const marginLeft = 150; // Increased to accommodate the y-axis title

    // Create the horizontal scale and its axis generator.
    const x = d3.scaleBand()
        .domain(ageStressData.map(d => d.Age))
        .range([marginLeft, width - marginRight])
        .padding(0.1);

    const xAxis = d3.axisBottom(x).tickSizeOuter(0);

    // Create the vertical scale.
    const y = d3.scaleLinear()
        .domain([0, d3.max(ageStressData, d => d.MeanStressLevel)]).nice()
        .range([height - marginBottom, marginTop]);

    const yAxis = d3.axisLeft(y);

    // Create the SVG container and call the zoom behavior.
    const svg = d3.select("body").append("svg")
        .attr("viewBox", [0, 0, width, height])
        .attr("width", width)
        .attr("height", height)
        .attr("style", "max-width: 100%; height: auto;")
        .call(zoom);

    // Append the bars.
    svg.append("g")
        .attr("class", "bars")
        .attr("fill", "#3d606e")
        .selectAll("rect")
        .data(ageStressData)
        .join("rect")
        .attr("x", d => x(d.Age))
        .attr("y", d => y(d.MeanStressLevel))
        .attr("height", d => y(0) - y(d.MeanStressLevel))
        .attr("width", x.bandwidth())
        .on("mouseover", function(event, d) {
            d3.select(this).attr("fill", "#153b47");
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`Age: ${d.Age}<br>Mean Stress Level: ${d.MeanStressLevel}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("fill", "#3d606e");
            tooltip.transition().duration(200).style("opacity", 0);
        });

        const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("text-align", "center")
        .style("width", "120px")
        .style("height", "55px")
        .style("padding", "2px")
        .style("background", "white")
        .style("border", "1px solid #ccc")
        .style("pointer-events", "none")
        .style("opacity", 0);

    // Append the axes.
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(xAxis)
        .call(g => g.selectAll("text").style("font-size", "12px"))
      .append("text")
        .attr("x", (width - marginLeft - marginRight) / 2 + marginLeft)
        .attr("y", marginBottom - 10)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .text("Age")
        .style("font-size", "20px");

    svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(yAxis)
        .call(g => g.select(".domain").remove())
      .call(g => g.selectAll("text").style("font-size", "12px"))
      .append("text")
      .attr("x", -marginLeft - 130)
      .attr("y", marginTop - 3)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .attr("transform", `rotate(-90, -${marginLeft / 2}, ${marginTop - 10})`)
        .text("Mean Stress Level")
        .style("font-size", "20px");

    return svg.node();

    function zoom(svg) {
        const extent = [[marginLeft, marginTop], [width - marginRight, height - marginTop]];

        svg.call(d3.zoom()
            .scaleExtent([1, 8])
            .translateExtent(extent)
            .extent(extent)
            .on("zoom", zoomed));

        function zoomed(event) {
            x.range([marginLeft, width - marginRight].map(d => event.transform.applyX(d)));
            svg.selectAll(".bars rect").attr("x", d => x(d.Age)).attr("width", x.bandwidth());
            svg.selectAll(".x-axis").call(xAxis);
        }
    }
});
