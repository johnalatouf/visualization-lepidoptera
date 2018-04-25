/* This file holds functions pertaining to legends */


//////// recolor the dots when the legend is updated
function recolorPoints(filter) {
	var full = [];
	if (filter == "species") {
		drawPointLegend(species_list);
		circles.attr("fill", function(d, i) {  
				t = species_list.indexOf(d.species)/species_list.length;
				return d3.interpolateWarm(t);
		} );
	} else if (filter == "genus") {
		drawPointLegend(genus_list);
		circles.attr("fill", function(d, i) {  
				t = genus_list.indexOf(d.genus)/genus_list.length;
				return d3.interpolateWarm(t);
		} );
	} else if (filter == "family") {
		drawPointLegend(family_list);
		circles.attr("fill", function(d, i) {  
				t = family_list.indexOf(d.family)/family_list.length;
				return d3.interpolateWarm(t);
		} );
	
	}
}

// draw the world legend
function drawWorldLegend(MAX_HEATMAP) {
	legend_svg.selectAll("g.legend").remove();
	//var legend = legend_svg.append("g")
	//.attr("class", "legend");
			
	d3.select("#legend_holder_world").html("<p>" + current_map_item.map_of + " Sightings</p>"
				+"<p>"+ cur_year + "</p>"
				+ "0 <div id='world_legend_grad'> </div> " + MAX_HEATMAP + "+");
				
	d3.select("#world_legend_grad")
			.style("background", "linear-gradient(to right, " + world_data_color_range[0] + " , " + world_data_color_range[1] + ")");
}

// hide the world legend
function clearWorldLegend(MAX_HEATMAP) {
	legend_svg.selectAll("g.legend").remove();
	//var legend = legend_svg.append("g")
	//.attr("class", "legend");
			
	d3.select("#legend_holder_world").html("<p></p>");
}

// draw the line chart legend
function drawLineLegend(filter_list) {
	// position the legend elements
		line_legend_svg.selectAll("g.line_legend").remove();
		var width = 400;
		var height = 1400;
		line_legend_svg.append("text")
			.attr("x", function(d) { return 13; })
			.attr("y", 10)
			.attr("dy", ".35em")
			.text("Show All")
			.style("font-size", "10pt")
			.on("mouseover", function(d, i) { 
				d3.select(this).attr("stroke", "blue");
				d3.select(this).attr("stroke-width", 1);
			})
		  .on("mouseout", function(d, i) {
				d3.select(this).attr("stroke-width", 0);
			})
			.on("click", function(d, i) {
				d3.select(this).attr("stroke-width", 0);
				// make all others faded out
				line_legend_svg.selectAll("g.line_legend").attr("opacity", 1);
				// show all dots
				d3.selectAll(".line_plot_dot").attr("opacity", 1);
				d3.selectAll(".line_plot_dot").attr("r", 1);
			});
			
		var line_legend = line_legend_svg.selectAll("append")
			.data(filter_list)
			.enter().append("g")
			.attr("transform", function(d,i) { return "translate(0, " + (20+i*20 + 10) + ")"; })
			.attr("class", "line_legend")
			.on("mouseover", function(d, i) { 
				d3.select(this).attr("stroke", "blue");
				d3.select(this).attr("stroke-width", 1);
				d3.selectAll(".line_plot_" + d.replace(/\s/g, "")).attr("stroke", "blue");
				d3.selectAll(".line_plot_" + d.replace(/\s/g, "")).attr("stroke-width", 2);
				d3.selectAll(".line_plot_" + d.replace(/\s/g, "")).attr("r", "2px");
				
				details.transition()			
						.style("opacity", .9)
						.duration(100);
						
				details.html("<p>Click to filter</p>")	
						.style("left", (d3.event.pageX - 200) + "px")		
						.style("top", (d3.event.pageY - 75) + "px");
			})
		  .on("mouseout", function(d, i) {
				d3.select(this).attr("stroke-width", 0);
				d3.selectAll(".line_plot_" + d.replace(/\s/g, "")).attr("stroke-width", 0);
				d3.selectAll(".line_plot_" + d.replace(/\s/g, "")).attr("r", "1px");
				
				details.transition()			
						.style("opacity", 0)
						.duration(100);
			})
		  .on("click", function(d, i) {
				d3.select(this).attr("stroke-width", 0);
				// make all others faded out
				line_legend_svg.selectAll("g.line_legend").attr("opacity", 0.5);
				d3.select(this).attr("opacity", 1);
				// fade out all dots
				d3.selectAll(".line_plot_dot").attr("opacity", 0);
				d3.selectAll(".line_plot_dot").attr("r", 0);
				d3.selectAll(".line_plot_" + d.replace(/\s/g, "")).attr("opacity", 1);
				d3.selectAll(".line_plot_" + d.replace(/\s/g, "")).attr("stroke-width", 0);
				d3.selectAll(".line_plot_" + d.replace(/\s/g, "")).attr("r", "1px");
			});
			
		line_legend.append("rect")
			.attr("x", 0)
			.attr("y", -6)
			.attr("width", 10)
			.attr("height", 10)
			.style("fill", function(d) { 
				//return colour(filter_list.indexOf(d)); 
				//t = filter_list.indexOf(d)/filter_list.length;
				//return d3.interpolateWarm(t);
				return categories_colors[d];
			});

		line_legend.append("text")
			//.attr("x", width - 218)
			.attr("x", function(d) { return 13; })
			.attr("y", 0)
			.attr("dy", ".35em")
			.text(function(d) { return d; })
			.style("font-size", "10pt");
}

// draw the legend for the geospatial points
function drawPointLegend(filter_list) {
	// position the legend elements
		legend_svg.selectAll("g.legend").remove();
		var width = 400;
		var height = 400;
		legend_svg
		.attr("height", (filter_list.length*20 + 30));
		var legend = legend_svg.selectAll("append")
			.data(filter_list)
			.enter().append("g")
			.attr("transform", function(d,i) { return "translate(0, " + (20+i*20) + ")"; })
			.attr("class", "legend")
			.on("mouseover", function(d, i) { 
				d3.select(this).attr("stroke", "white");
				d3.select(this).attr("stroke-width", 1);
				d3.selectAll("." + d.replace(/\s/g, "")).attr("stroke", "white");
				d3.selectAll("." + d.replace(/\s/g, "")).attr("stroke-width", 3);
				d3.selectAll("." + d.replace(/\s/g, "")).attr("r", "5px");
			})
		  .on("mouseout", function(d, i) {
				d3.select(this).attr("stroke-width", 0);
				d3.selectAll("." + d.replace(/\s/g, "")).attr("stroke-width", 0);
				d3.selectAll("." + d.replace(/\s/g, "")).attr("r", "2px");
			});
		
		// add the squares to the legend
		legend.append("rect")
			.attr("x", 0)
			.attr("y", -6)
			.attr("width", 10)
			.attr("height", 10)
			.style("fill", function(d) { 
				//return colour(filter_list.indexOf(d)); 
				t = filter_list.indexOf(d)/filter_list.length;
				return d3.interpolateWarm(t);
			});

		legend.append("text")
			//.attr("x", width - 218)
			.attr("x", function(d) { return 13; })
			.attr("y", 0)
			.attr("dy", ".35em")
			.text(function(d) { return d; })
			.style("font-size", "10pt");
}

