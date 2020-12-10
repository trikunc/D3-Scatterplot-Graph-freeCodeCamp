import React, { useEffect, useRef, useState } from "react";
import "./styles.css";
import {
  max,
  min,
  select,
  scaleTime,
  axisBottom,
  axisLeft,
  timeFormat,
  format
} from "d3";
// import timeFormat from "d3-time-format";

const convertMinAndSec = (str) => {
  return new Date(`2010 01 01 00:${str}`);
};

export default function App() {
  const [data, setData] = useState([]);
  const svgRef = useRef();

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
    )
      .then((response) => response.json())
      .then((data) => {
        setData(
          data.map((item) => [
            convertMinAndSec(item.Time),
            item.Year,
            item.Doping,
            item.Name,
            item.Nationality
          ])
        );
      });
  }, []);

  useEffect(() => {
    const width = 800;
    const height = 400;
    const padding = 40;
    const circle = 6;
    console.log(data[0]);
    const svg = select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    let tooltip = select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    const yScale = scaleTime()
      .domain([min(data, (d) => d[0]), max(data, (d) => d[0])])
      .range([padding, height - padding]);

    const xScale = scaleTime()
      .domain([min(data, (d) => d[1]), max(data, (d) => d[1])])
      .range([padding, width - padding]);

    const formatMinSec = timeFormat("%M:%S");

    const xAxis = axisBottom(xScale).tickFormat(format("d"));
    const yAxis = axisLeft(yScale).tickFormat(formatMinSec);
    svg
      .select(".x-axis")
      .attr("transform", `translate(0, ${height - padding})`)
      .call(xAxis);

    svg
      .select(".y-axis")
      .attr("transform", `translate(${padding}, 0)`)
      .call(yAxis);

    svg
      .selectAll("class", "circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d, i) => xScale(d[1]))
      .attr("cy", (d, i) => yScale(d[0]))
      .attr("r", circle)
      .attr("data-xvalue", (d, i) => d[1])
      .attr("data-yvalue", (d, i) => d[0])
      .attr("yvalue", (d) => d[0])
      .attr("fill", (d) => (d[2] === "" ? "#ffaf40" : "#ffcccc"))
      .attr("stroke", "black")
      .on("mouseover", function (event, value) {
        // const index = svg.selectAll("rect").nodes().indexOf(this);
        let coordinates = [event.pageX, event.pageY];
        console.log(coordinates);

        select(this).classed("active", true);

        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          // .attr("data-date", value[0])
          .attr("data-year", value[1])
          .attr("id", "tooltip")
          .html(
            `
            <p><strong>${value[3]} - ${value[4]}</strong></p>
              <p>Year: <strong>${
                value[1]
              }</strong> - Time: ${value[0].getMinutes()}:${value[0].getSeconds()}</p>
              ${value[2] ? `<p>${value[2]}</p>` : ""}
            `
          )
          .style("left", event.clientX + "px")
          .style("top", coordinates[1] + "px");
      })
      .on("mouseout", function (d) {
        select(this).classed("active", false);
        tooltip.transition().duration(100).style("opacity", 0);
      });

    const legend = svg.append("g").attr("id", "legend");

    legend
      .append("text")
      .attr("x", 590)
      .attr("y", 35)
      .text("Riders with doping allegations")
      .style("font-size", "13px");

    legend
      .append("rect")
      .attr("width", "20px")
      .attr("height", "20px")
      .attr("x", 590 + 170)
      .attr("y", 20)
      .style("fill", "#ffcccc");

    legend
      .append("text")
      .attr("x", 590)
      .attr("y", 60)
      .text("No doping allegations")
      .style("font-size", "13px");

    legend
      .append("rect")
      .attr("width", "20px")
      .attr("height", "20px")
      .attr("x", 590 + 170)
      .attr("y", 45)
      .style("fill", "#ffaf40");
  }, [data]);

  return (
    <div className="App">
      <h1 id="title">Doping in Professional Bicycle Racing</h1>
      <svg ref={svgRef}>
        <g className="x-axis" id="x-axis" />
        <g className="y-axis" id="y-axis" />
      </svg>
    </div>
  );
}
