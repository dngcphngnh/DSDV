d3.csv("https://raw.githubusercontent.com/dngcphngnh/DSDV/main/Data.csv").then(function(data) {
    // Process and group data
    let groupedData = Array.from(
        d3.group(data, d => d.Age),
        ([key, values]) => ({
            Age: +key,
            SleepDuration: d3.mean(values, d => +d.SleepDuration).toFixed(2)
        })
    );

    groupedData.sort((a, b) => a.Age - b.Age);

    let width = 1200;
    let height = 600;
    let marginTop = 40;
    let marginRight = 10;
    let marginBottom = 60;
    let marginLeft = 150;

    // Define x scale
    let x = d3.scaleLinear()
        .domain([d3.min(groupedData, d => d.Age), d3.max(groupedData, d => d.Age)]).nice()
        .range([marginLeft, width - marginRight]);


    // Define y scale
    let y = d3.scaleLinear()
        .domain([0, d3.max(groupedData, d => d.SleepDuration)]).nice()
        .range([height - marginBottom, marginTop]);

    // Create the SVG container.
    let svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height]);

    
    svg.append("g")
        .attr("fill", "#3d606e")
        .selectAll("rect")
        .data(groupedData)
        .join("rect")
        .attr("x", d => x(d.Age) - 10)
        .attr("y", d => y(d.SleepDuration))
        .attr("height", d => y(0) - y(d.SleepDuration))
        .attr("width", 25) // Fixed width for bars
        .on("mouseover", function(event, d) {
            d3.select(this).attr("fill", "#153b47");
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`Age: ${d.Age}<br>Mean Sleep Duration: ${d.SleepDuration}`)
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
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .text("Age")
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
        .attr("x", -marginLeft - 200)
        .attr("y", marginTop - 3)
        .attr("fill", "black")
        .text("Mean Sleep Duration")
        .attr("text-anchor", "middle")
        .style("font-size", "20px");


    // Create a tooltip div that is hidden by default
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

    }).catch(function(error) {
    console.log(error);
});
