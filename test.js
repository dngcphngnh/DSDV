d3.csv("https://raw.githubusercontent.com/dngcphngnh/DSDV/main/Data.csv").then(function(data) {
    // Convert Count values to numbers and extract SleepDisorder and Gender
    data.forEach(d => {
        d.SleepDisorder = d.SleepDisorder; // Assuming SleepDisorder is a string and doesn't need conversion
        d.Gender = d.Gender; // Assuming Gender is a string and doesn't need conversion
    });

    // Group and summarize data by Gender and SleepDisorder
    let groupedData = Array.from(
        d3.rollups(data, v => v.length, d => d.Gender, d => d.SleepDisorder),
        ([Gender, SleepDisorders]) => ({
            Gender,
            SleepDisorders: SleepDisorders.map(([SleepDisorder, Count]) => ({ SleepDisorder, Count }))
        })
    );

    console.log(groupedData); // Check the transformed data structure

    // Specify the chart’s dimensions.
    let width = 800;
    let height = 400;
    let marginTop = 20;
    let marginRight = 30;
    let marginBottom = 30;
    let marginLeft = 40;

    // Declare the x (horizontal position) scale and the corresponding axis generator.
    let x0 = d3.scaleBand()
        .domain(groupedData.map(d => d.Gender))
        .range([marginLeft, width - marginRight])
        .padding(0.1);

    let x1 = d3.scaleBand()
        .domain([...new Set(data.map(d => d.SleepDisorder))])
        .range([0, x0.bandwidth()])
        .padding(0.05);

    let xAxis = d3.axisBottom(x0).tickSizeOuter(0);

    // Declare the y (vertical position) scale.
    let y = d3.scaleLinear()
        .domain([0, d3.max(groupedData, d => d3.max(d.SleepDisorders, s => s.Count))])
        .nice()
        .range([height - marginBottom, marginTop]);

    // Define a color scale
    let color = d3.scaleOrdinal()
        .domain([...new Set(data.map(d => d.SleepDisorder))])
        .range(["#03045e","#0077b6","#00b4d8"]);

    // Create the SVG container.
    let svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, height])
        .attr("style", `max-width: ${width}px; height: auto; font: 10px sans-serif; overflow: visible;`);

    // Create a tooltip div that is hidden by default
    let tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("display", "none");

    // Create a group for each Gender and then create a bar for each SleepDisorder within that group.
    svg.append("g")
        .selectAll("g")
        .data(groupedData)
        .join("g")
        .attr("transform", d => `translate(${x0(d.Gender)},0)`)
        .selectAll("rect")
        .data(d => d.SleepDisorders)
        .join("rect")
        .attr("x", d => x1(d.SleepDisorder))
        .attr("y", d => y(d.Count))
        .attr("height", d => y(0) - y(d.Count))
        .attr("width", x1.bandwidth())
        .attr("fill", d => color(d.SleepDisorder))
        .on("mouseover", function(event, d) {
            tooltip.style("display", "block")
                .html(`Sleep Disorder: ${d.SleepDisorder}<br>Count: ${d.Count}`);
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("display", "none");
        });

    // Create the axes.
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(xAxis);

    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove());

    // Append the SVG to the DOM.
    document.body.appendChild(svg.node());

})
.catch(function(error) {
    console.log(error);
});
