// This file handles the pie chart specifically
var pie = {};											// stores the pies
var circle = {};										// stores the pie circles
var arcs = {};											// stores the pie arcs
var pie_chart_data = {};								// stores the pie data for redraw
var outer_clicked = inner_clicked = -1;					// clicked pie wedges for coloring

// processes the pie chart data and calls the function to draw the pie chart
// this can use the same data as the line charts, but process it to get totals
function drawPieChart(binned_data, class_data) {
		var arc_y = 100;
		var arc_padding = 1.15;
		var pieoffset = 20;
		
		// TODO - this should be dynamic, but specify order somehow to draw overlapping pies
		var pie_order = ['family', 'genus', 'species'];
		pie_order = pie_order.reverse();
		
		//attach the chart to the div
		var chart = d3.select("#pie_chart")
			.append('svg')
			.attr("width", w)
			.attr("height", h )
			.attr("id", "pie_chart_svg");
			
			chart.append("g")
			.attr("id", "pie_chart_group")
			.attr("transform", "translate(" + w/2 + "," + h/2 + ")");
		
				
		//process the data
		var count_data = {};
		var data = {};
		// start by getting counts for every item
		
		for (b in binned_data) {
			if (b == "total") {
				continue;
			}
			
			if (!(b in data)) {
				count_data[b] = [];
			}
			for (c in binned_data[b]) {
				
				if (c in count_data[b]) {
					count_data[b][c] += binned_data[b][c].length;
				} else {
					count_data[b][c] = binned_data[b][c].length;
				}
			}
		}
		
		// now turn that into a set of arrays
		var famcol = {};
		for (b in count_data) {
			if (b == "total") {
				continue;
			}
			
			if (!(b in data)) {
				data[b] = [];
			}
			
			var i = j = k = 0;
			for (c in count_data[b]) {
				if (b == "genus") {
					var colors = d3.interpolateRainbow(parseFloat(i)/parseFloat(500));
					data[b].push({"name": c, "value" : count_data[b][c], "family": class_data["genus"][c]["f"], "color" : colors});
					i++;
				} else if (b == "species") {
					var colors = d3.interpolateRainbow(1 - parseFloat(j)/parseFloat(1000));
					data[b].push({"name": c, "value" : count_data[b][c], "family": class_data["species"][c]["f"], "genus": class_data["species"][c]["g"], "color" : colors});
					j++;
				} else {
					
					var colors = d3.interpolateRainbow(parseFloat(k)/parseFloat(Object.keys(count_data[b]).length));
					data[b].push({"name": c, "value" : count_data[b][c], "color" : colors});
					k++;
				}
			}
		}
		// build the arcs in a loop
		// to get the animation, this should overlap, smallest on top
		//var arcs = [];
		var ir = 0;
		//var or = 140;
		var or = 280;
		
		pie_chart_data = $.extend({}, data);
		reDrawPieChart(data, class_data, binned_data["total"][0].date, binned_data["total"][binned_data["total"].length-1].date);
		
		//set the legend text
		// d3.select("#pie_legend").html("<p>Sightings in " + current_map_item.map_of + "</p>"
// 									+ "<p>Showing: total for period: " +
// 									binned_data["total"][0].date + " to: " + binned_data["total"][binned_data["total"].length-1].date + "</p>");
		//pieChartLegend(binned_data["total"][0].date, binned_data["total"][binned_data["total"].length-1].date, d.data.name + " genus");	
		
}

// when the pie chart is clicked
function pieChartClick(clicked, d, i, data, class_data, start_date, end_date) {
	if (clicked.attr("class").includes("arc_family")) {
		// this is the family thing
		// get the genuses that are in this family
		var gd = [];
		
		for (g in pie_chart_data["genus"]) {
			if (pie_chart_data["genus"][g].family == d.data.name) {
				gd.push(pie_chart_data["genus"][g]);
			}
		}
		var sd = [];
		for (s in pie_chart_data["species"]) {
			if (pie_chart_data["species"][s].family == d.data.name) {
				sd.push(pie_chart_data["species"][s]);
			}
		}
		
		data["genus"] = gd;
		data["species"] = sd;
		
		outer_clicked = i;
		inner_clicked = -1;
		
		reDrawPieChart(data, class_data, start_date, end_date);
		
		var fill = pie_chart_data["family"][i]["color"];
		
		d3.selectAll(".arc_family").selectAll("path").style("fill", "grey");
		d3.selectAll("." + d.data.name).selectAll("path").style("fill", fill);
		
		// update the legend
		pieChartLegend(start_date, end_date, d.data.name + " family");
									
	} else if (clicked.attr("class").includes("arc_genus")) {
		// this is the family thing
		// get the genuses that are in this family
		
		var sd = [];
		for (s in pie_chart_data["species"]) {
		
			if (pie_chart_data["species"][s].genus == d.data.name) {
				sd.push(pie_chart_data["species"][s]);
			}
		}
		data["species"] = sd;
		
		inner_clicked = i;
		
		reDrawPieChart(data, class_data, start_date, end_date);
		
		var fill = pie_chart_data["genus"][i]["color"];
		
		d3.selectAll(".arc_genus").selectAll("path").style("fill", "grey");
		d3.selectAll("." + d.data.name).selectAll("path").style("fill", fill);
		
		// update the legend
		// d3.select("#pie_legend").html("<p>Sightings in " + current_map_item.map_of + "</p>"
// 									+ "<p>Showing: " + d.data.name + " genus for period: " +
// 									start_date + " to: " + end_date + "</p>");
		pieChartLegend(start_date, end_date, d.data.name + " genus");
	}
}


/// a redrawing function
function reDrawPieChart(data, class_data, start_date, end_date) {

		// remove existing circles
		d3.selectAll(".arc_family").remove();
		d3.selectAll(".arc_genus").remove();
		d3.selectAll(".arc_species").remove();
		
		var arc_y = 100;
		var arc_padding = 1.15;
		var pieoffset = 20;
		
		// TODO - this should be dynamic, but specify order somehow to draw overlapping pies
		var pie_order = ['family', 'genus', 'species'];
		pie_order = pie_order.reverse();
		
		//attach the chart to the div
		// var chart = d3.select("#pie_chart")
// 			.append('svg')
// 			.attr("width", w)
// 			.attr("height", h )
// 			.append("g")
// 			.attr("transform", "translate(" + w/2 + "," + h/2 + ")");
		var chart = d3.select("#pie_chart_group");
		
		
		
		var ir = 0;
		//var or = 140;
		var or = 300;
		var colour_order = 1;
		for (p in pie_order) {
			var b = pie_order[p];
			arcs[b] = d3.arc()
				.innerRadius(ir)
				.outerRadius(or);
			//ir = or;
			//or += 70;
			or -= 80;
			
			pie[b] = d3.pie()
				.value(function(d) { return d.value; })
				.sort(function(a, c) {
					if (b == "family") {
						return a.name.localeCompare(c.name);
					} else if (b == "genus") {
						return a.family.localeCompare(c.family);
					} else if (b == "species") {
						return a.family.localeCompare(c.family);
					}
					
				});
			
			circle[b] = chart.selectAll(".arc_" + b)
				.data(pie[b](data[b]))
				.enter().append("g")
				.attr("class", function(d) {
						var cl = "arc_" + b + " ";
						if (b == "family") {
							return cl + d.data.name.replace(/\s/g, "");
						}else if (b == "genus") {
							return cl + d.data.name.replace(/\s/g, "") + " f_" + d.data.family.replace(/\s/g, "");
						}else if (b == "species") {
							return cl + d.data.name.replace(/\s/g, "") 
								+ " f_" + d.data.family.replace(/\s/g, "")
								+ " g_" + d.data.genus.replace(/\s/g, "");
						}
					})
				.on("mouseover", function(d, i) { 
					// show an overlay
					details.transition()			
						.style("opacity", .9)
						.duration(100);		
					details.html("" + d.data.name + "<br />" + d.data.value)	
						.style("left", (d3.event.pageX) + "px")		
						.style("top", (d3.event.pageY - 75) + "px");
					scalePath(d3.select(this), 1.3, pieoffset);
					var class_name = d3.select(this).attr('class').split(' ');
					if (class_name.length == 2) {
						var famname = class_name[1];
						var other = chart.selectAll(".f_" + famname);
						scalePath(other, 1.2, pieoffset);
						
					} else if (class_name.length == 3) {
						var gamname = class_name[1];
						var other = chart.selectAll(".g_" + gamname);
						scalePath(other, 1.2, pieoffset);
						
					}
				
				})
				.on("mouseout", function() {
					details.transition()		
						.duration(200)		
						.style("opacity", 0);
					scalePath(d3.select(this), 1, pieoffset);
					var class_name = d3.select(this).attr('class').split(' ');
					if (class_name.length == 2) {
						var famname = class_name[1];
						var other = chart.selectAll(".f_" + famname);
						scalePath(other, 1, pieoffset);
					} else if (class_name.length == 3) {
						var gamname = class_name[1];
						var other = chart.selectAll(".g_" + gamname);
						scalePath(other, 1, pieoffset);
						
					}
				})
				.on("click", function(d, i) {
					pieChartClick(d3.select(this), d, i, data, class_data, start_date, end_date);
				})
				.each(function(d) { this._current = d; }); // store the initial angles
				;

				circle[b].append("path")
					.attr("d", arcs[b])
					.attr("id", function(d, i) {return "pie_" + i;})
					.style("fill", function(d, i) { 
						if (b == "family" && outer_clicked > -1 && outer_clicked == i)
							return d.data.color;
						else if (b == "genus" && inner_clicked > -1 && inner_clicked == i)
							return d.data.color;
						else if (b == "family" && outer_clicked > -1)
							return "grey";
						else if (b == "genus" && inner_clicked > -1)
							return "grey";
						else
							return d.data.color;
					})
					.style("stroke-width", 0.3)
					.style("stroke", "white");
				colour_order *= -1;
				
				
				
		}
		
		console.log("PIE CHART IN");
		var center_chart = chart.append("circle")
			.attr("cx", 0)
			.attr("cy", 0)                                  
			.attr("r", 40)
			.style("fill", "black")
			.on("click", function () {
				//redraw the whole thing
				var data = $.extend({}, pie_chart_data);
				inner_clicked = -1;
				outer_clicked = -1;
				reDrawPieChart(data, class_data, start_date, end_date);
			})
			.on("mouseover", function(d, i) { 
					// show an overlay
					details.transition()			
						.style("opacity", .9)
						.duration(100);		
					details.html("Reset")	
						.style("left", (d3.event.pageX) + "px")		
						.style("top", (d3.event.pageY - 75) + "px");
					scalePath(d3.select(this), 1.3, 0);
				
				})
				.on("mouseout", function() {
					details.transition()		
						.duration(200)		
						.style("opacity", 0);
					scalePath(d3.select(this), 1, 0);
				});
				
		pieChartLegend(start_date, end_date, "total");
		
		
}

//created for CSCI Assignment 1
//scale a radial path for a pie chart
function scalePath(p, scale, offset) {
	var path = p.transition();
	path.attr("transform", "scale(" + scale + ") ");
}

// process the data to make classification data
function classificationData(data) {
	var species = {};
	var genus = {};
		
	for (d in data) {
		species[data[d]['s']] = {"f": data[d]['f'], "g": data[d]['g']};
		genus[data[d]['g']] = {"f": data[d]['f']};
	}
	
	return {"species": species, "genus": genus};
}

// the pie chart legend
function pieChartLegend(start_date, end_date, category) {
	d3.select("#pie_legend").html("<p>Sightings in " + current_map_item.map_of + "</p>"
									+ "<p>Showing: " + category + " for period: " +
									start_date + " to: " + end_date + "</p>");
}
 
