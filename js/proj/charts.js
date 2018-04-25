// constant values
var TEMP_MIN = -40;
var TEMP_MAX = 50;
var PREC_MIN = 0;
var PREC_MAX = 250;
var SNOW_MIN = 0;
var SNOW_MAX = 162;
var MAX_HEATMAP = 1000;

// used for storing the line chart axes
var group_x = {};
var group_y = {};
var line_x_dict = {};
var line_y_dict = {};
var line_graph_transforms;

// for nice text
var month_to_text = ['', 'January', 'February', 'March', 'April', 'May', 'June', 
				'July', 'August', 'September', 'October', 'November', 'December', ''];
var climate_to_text = {
	'Tx': 'Highest Temp', 
	'Tm': 'Mean Temp',
	'Tn': 'Lowest Temp',
	'P': 'Precipitation',
	'S': 'Snow',
	}
// for nice climate text	
var climate_unit_to_text = {
	'Tx': '&deg;C', 
	'Tm': '&deg;C',
	'Tn': '&deg;C',
	'P': 'mm',
	'S': 'cm',
}

//max and mins
world_min = {
	'Tx': 0, 
	'Tm': -10,
	'Tn': -50,
	'P': 0,
	'S': 0,
}
world_max = {
	'Tx': 40, 
	'Tm': 20,
	'Tn': 0,
	'P': 10000,
	'S': 1000,
}

var formatDecimalComma = d3.format(",.2f");

var data_path = "../data/butterflies_total.csv";
var display_data_json;
var SCALE_CHANGE = 0.1;


var current_scale;								// scale of the map
var current_center = [0, 0];					// center of the map
var current_climate_filter = 'Tx';				// what climate type to display
var current_world_climate_filter = 'Tx';		// what climate type to display
var projection = d3.geoMercator();				// map projection converter
var mouse_is_down = false;						
var clicked_mouse_down;							// mouse is down
var parseTime = d3.timeParse("%Y-%m");			// changes strings to dates
var parseYear = d3.timeParse("%Y");				// changes strings to dates

var binned_line_data;

// for responses
var start_month = 8; 							// start month on time slider
var end_month = 9; 								// end month on time slider
var cur_year = 2017; 							// selected year
var cur_country = "CA"; 						// current country code for geospatial data
var full_year_response;							// all the geo data		

// for points
var circles;									// all the circles displayed on the map
var species_list = [];							// the list of species of this year
var genus_list = [];							// the list of genuses of this year
var family_list = [];							// the list of families of this year

var map_group;

// Climate information
var climate_data;								// holds all the climate data of map
var current_climate_data = {};					// the climate data currently displayed
var colour;										// map colour by climate
var world_data_color;
var climate_color_range = ["#e5f9ff", "#0077e0"]; // the color range
var world_data_color_range = ["#7b47b7", "#ff0707"]; // the color range
var categories_colors = {}						// holds all the cat colours
//background: linear-gradient(to right, #e5f9ff , #0077e0);

// world data
var world_climate_data;

world_data_color = d3.scaleLinear()
	.domain([0, 1]);
world_data_color.range(world_data_color_range);

var world_map = "https://unpkg.com/world-atlas@1/world/110m.json";

var world_item = new MapItem("world", "world", 6.9, [0,30], -1);
var zoom_out_country = -1; 						// zooms back out to country or world
var current_map_item;							// saves the current item for zooms
var rectangles;

var country_maps = {};
var dragx = 0;
var	dragy = 0;

var drawing = false;

//country map stuff
var country_id = new Array(300); // just index the countries, so country_id[124] = "Canada"
// country_id[124] = "Canada";
country_id[124] = new MapItem("Canada", "Canada", 2.0, [-100,62], 124);
country_id[84] = new MapItem("USA", "USA", 2.0, [-100,62], 124);


// country_maps["Canada"] = "https://raw.githubusercontent.com/mdgnkm/SIG-Map/master/canada.json";
country_maps["Canada"] = "data/canada.json";
//country_maps["USA"] = "https://d3js.org/us-10m.v1.json";

// the height and width of the main map chart
h = 600;
w = h*1.5;

// for line charts
var line_height = 80;
var line_x = d3.scaleTime()
	.rangeRound([0, w-25]);
var line_y = d3.scaleLinear()
	.rangeRound([line_height, 0]);
	
var xAxis = {};
var yAxis = {};

var svg = d3.select("#map_holder").append("svg")
.attr("width", w)
.attr("height", h);

// legend svg
var legend_svg = d3.select("#legend_holder").append("svg")
.attr("width", 200)
.attr("height", 300);

// line legend div
var line_legend_svg = d3.select("#line_legend").append("svg")
.attr("width", 200)
.attr("height", 2300);

// a div for click details
var details = d3.select("body").append("div")	
	.attr("class", "click-details")				
	.style("opacity", 0);

// tool tip div	
var tooltip = d3.select("body").append("div")	
	.attr("class", "tooltip-details")				
	.style("opacity", 0);

// a div for rollover line details
var line_details = d3.select("body").append("div")	
	.attr("class", "line_details")				
	.style("opacity", 0);

// climate detail div	
var climate_details = d3.select("#climate_display");

// the line charts
var lines_data = d3.select("#lines_data")
	.call(d3.zoom()
	.scaleExtent([1, 10])
	.on("zoom", zoomed_line));
var lines_Tx = d3.select("#lines_Tx");
var lines_Tm = d3.select("#lines_Tm");
var lines_Tn = d3.select("#lines_Tn");
var lines_P = d3.select("#lines_P");
var lines_S = d3.select("#lines_S");


// build the world map
buildMap(world_map, world_item);

// bin the data
getWorldData();


//////////////////////// pip slider

var pipsSlider = document.getElementById('slider-pips');
// format slider

//document.getElementById('slider-pips').style.top = getHeight() + "px";
document.getElementById('slider-pips').style.width = (w) + "px";

noUiSlider.create(pipsSlider, {
	start: [ start_month, end_month ],
	step: 1,
	behaviour: 'drag',
	connect: true,
	range: {
		'min':  1,
		'max':  13
	},
	pips: { mode: 'count', values: 13, format: {
			to: function(a){
				return month_to_text[parseInt(a)];
			}
		} 
	}
});

var pips = pipsSlider.querySelectorAll('.noUi-value');

for ( var i = 0; i < pips.length; i++ ) {

	// For this example. Do this in CSS!
	pips[i].style.cursor = 'pointer';
	pips[i].addEventListener('click', clickOnPip);
}

pipsSlider.noUiSlider.on('update', function(){
	
	var vals = pipsSlider.noUiSlider.get();
	start_month = parseInt(vals[0]);
	end_month = parseInt(vals[1]);
	filterByMonthClass();
	if (climate_data != null) {
		filterClimateDataMonthly(current_climate_filter);
		
		//move the lines
		moveDateSpanLines();
	}
	
	svg.selectAll("g.map-group")
	.attr("fill", function(d, i) { 
	
	// TODO - can't read properties
	if (d != null && d.properties != null)
		return current_climate_data[d.properties.CODE].color;
	else
		return "black";
	} );
	
});

// css fixes
var piptext = d3.selectAll('.noUi-value');
piptext.style("color", "blue");
piptext.style("margin-left", "4%");

/////////////////////// end pip slider


//////////////////////// ui effects
$( "#legend_holder" ).toggle();
$( "#climate_display" ).toggle();
$( "#line_legend" ).toggle();

$( "#toggle_legend_holder" ).click(function() {
	$( "#legend_holder" ).toggle();
});
$( "#toggle_climate_legend" ).click(function() {
	$( "#climate_display" ).toggle();
});
$( "#toggle_line_legend" ).click(function() {
	$( "#line_legend" ).toggle();
});

// do some CSS
$(".btn_zoom_back").css("left", (w/2 - 30) + "px");

//////////////////////// end ui effects
	

/// for zooming
function zoomed() {
	
	if (circles != null) {
		var dots = d3.selectAll(".plot_circle");
		dots.attr("transform", function(d) {
			var offsetX = parseFloat(d3.select(this).attr("cx"))+1;
			var offsetY = parseFloat(d3.select(this).attr("cy"))+1;
			return "translate("+offsetX+ ","+offsetY+") scale("+ 1/d3.event.transform.k + "), translate("+(-1*offsetX)+","+(-1*offsetY)+ ")";
		});
	}
	svg.selectAll("g.map-group").attr("transform", d3.event.transform);
	svg.selectAll("g.circles").attr("transform", d3.event.transform);
	svg.selectAll("g.squares").attr("transform", d3.event.transform);
	current_scale = d3.event.transform;
}
	
	
function zoomed_line(){
  // create new scale ojects based on event
	d3.selectAll(".lc_path").attr("transform", d3.event.transform);
	d3.select(".line_graph_dots").attr("transform", d3.event.transform);
	line_graph_transforms = d3.event.transform;
	for (key in group_x) {
		let new_xScale = d3.event.transform.rescaleX(line_x_dict["data"]);
		let new_yScale = d3.event.transform.rescaleY(line_y_dict["data"]);
	  
  // update axes
		group_x[key].call(xAxis[key].scale(new_xScale));
		group_y[key].call(yAxis[key].scale(new_yScale));
	  //group_y[key].remove();
	}
  
	d3.selectAll(".lc_start_month").attr("transform", d3.event.transform);
	d3.selectAll(".lc_end_month").attr("transform", d3.event.transform);


}

/////// draw the world data dots
function drawWorldPoints(point_data) {
	svg.selectAll(".bin_rect").remove();
	// appending the circles
	// svg.append("g")
// 			.attr("class", "squares plot_bin");
	drawing = true;
	
	
	var rect_padding = 0.5;
	// build the circles
	 circles = d3.selectAll('g.squares').selectAll("append")
		.data(point_data).enter()
		.append("rect")
		.attr("x", function (d) { return projection([d.lng, d.lat])[0]-1 + rect_padding; })
		.attr("y", function (d) { return projection([d.lng, d.lat])[1]-1 + rect_padding; })
		.attr("width", function (d) { 
			// need to consider ones that stretch across
			if (parseInt(d.lng) == -180) {
				
				return Math.abs(projection([1, d.lat])[0] - projection([0, d.lat-1])[0]) - rect_padding;
			}
			return Math.abs(projection([d.lng, d.lat])[0] - projection([d.lng-1, d.lat-1])[0]) - rect_padding;
		})
		.attr("height", function (d) { 
			return Math.abs(projection([d.lng, d.lat])[1] - projection([d.lng-1, d.lat-1])[1]) - rect_padding;
		})
		.attr("class", "bin_rect")

		.attr("fill", function(d, i) {  
			//return colour(species_list.indexOf(d.species));
			return world_data_color(parseFloat(d.value)/parseFloat(MAX_HEATMAP));
		} )

		if (current_scale != null) {
			svg.selectAll("g.squares").attr("transform", current_scale);
			
		}
		
		drawWorldLegend(MAX_HEATMAP);
		
}
	
// process the data
function processWorldData(response_data) {
	var data = [];
	for (i in response_data) {
		var ll = i.split(",");
		data.push({"lng" : ll[0], "lat" : ll[1], "value" : response_data[i]});
	}
	
	return data;
}

//////// draw the dots
function drawPoints(point_data) {
	// appending the circles
	svg.append("g")
		.attr("class", "circles");
	drawing = true;
	svg.selectAll(".plot_circle").remove();
	species_list.splice(0, species_list.length);
	species_list.splice(0, species_list.length);
	species_list.splice(0, species_list.length);
	// fill the lists
	for (p in point_data) {
		if (!species_list.includes(point_data[p].species)) {
			species_list.push(point_data[p].species);
		}
		if (!genus_list.includes(point_data[p].genus)) {
			genus_list.push(point_data[p].genus);
		}
		if (!family_list.includes(point_data[p].family)) {
			family_list.push(point_data[p].family);
		}
	}
	//sort the lists
	species_list.sort();
	genus_list.sort();
	family_list.sort();

	
	// build the circles
	 circles = d3.selectAll('g.circles').selectAll("append")
		.data(point_data).enter()
		.append("circle")
		.attr("cx", function (d) { return projection([d.decimallongitude, d.decimallatitude])[0]; })
		.attr("cy", function (d) { return projection([d.decimallongitude, d.decimallatitude])[1]; })
		.attr("r", "2px")
		.attr("class", function(d,i) {
			return "plot_circle " + d.family.replace(/\s/g, "") 
					+ " " + d.genus.replace(/\s/g, "") 
					+ " " + d.species.replace(/\s/g, "")
					+ " m" + d.month; 
		})
		.on("click", function(d,i) {
			details.transition()			
					.style("opacity", .9)
					.duration(100);	
					var wiki_species = d.species.replace(/\s/g, "_");
			details.html("<p>Genus: " + d.genus + "</p>" + "<p>Species: " + d.species + "</p>" +
						 "<p>Date: " + d.eventdate + "</p>"
						 + "<p><a href='https://en.wikipedia.org/wiki/" + wiki_species + "' target='_blank' class='wiki_link'>View on Wikipedia</a></p>"
						 + "<p onClick='closeDetails(details)' class='close_details'>close</p>")	
					.style("left", (d3.event.pageX) + "px")		
					.style("top", (d3.event.pageY - 75) + "px");
		})
		.attr("fill", function(d, i) {  
			//return colour(species_list.indexOf(d.species));
			t = species_list.indexOf(d.species)/species_list.length;
			return d3.interpolateWarm(t);
		} )
		.on("mouseover", function(d, i) { 
				d3.select(this).attr("stroke", "white");
				d3.select(this).attr("stroke-width", 1);
				d3.select(this).attr("r", "5px");
		})
		.on("mouseout", function(d, i) {
			d3.select(this).attr("stroke", "white");
				d3.select(this).attr("stroke-width", 0);
				d3.select(this).attr("r", "2px");
		});
		
		if (current_scale != null) {
			svg.selectAll("g.circles").attr("transform", current_scale);
			d3.selectAll(".plot_circle").attr("transform", function(d) {
				var offsetX = parseFloat(d3.select(this).attr("cx"))+1;
				var offsetY = parseFloat(d3.select(this).attr("cy"))+1;
				return "translate("+offsetX+ ","+offsetY+") scale("+ 1/current_scale.k + "), translate("+(-1*offsetX)+","+(-1*offsetY)+ ")";
			});
		}
		
		filterByMonthClass();
		
		// draw the legend to go with these
		drawPointLegend(species_list);
		drawing = false;
		
}

/////////// building the map
// clears out old map, gets json for new map
// sets the year text	
function buildMap(map_json, map_item) {
 	current_scale = null 		// set this back to null
 
 	document.getElementById("year_prev").innerHTML = cur_year -1;
 	document.getElementById("year_next").innerHTML = cur_year +1;
 	document.getElementById("year_display").innerHTML = "" +cur_year;
 	
 	details.transition()		
		.duration(200)		
		.style("opacity", 0);
 	current_map_item = map_item;
 	if (map_item.map_of == "Canada") {
		//current_map_item = map_item;
		zoom_out_country = map_item.id;
		clearWorldLegend(MAX_HEATMAP);
	}
	// clear out old map
 	svg.selectAll("g.map-group").remove()
	// make new map group
 	svg.append("g")
 		.attr("class", "map-group")
 		.call(d3.zoom()
        .scaleExtent([1, 10])
        .on("zoom", zoomed))
		.attr("width", w)
		.attr("height", h)
		.attr("x", 0)
		.attr("y", 0)
		.attr("cx", 0)
    	.attr("cy", 0)
		
		.attr("fill", "#cbd2db");

	rectangles = svg.selectAll("g")
                             .append("rect")
                             .attr("width", w)
                             .attr("height", h)
                             .attr("fill", "#cbd2db");
	

	projection
		.center(map_item.center)
		.scale(w/map_item.scale)
		.translate( [w / 2, h / 2]);

	svg
		.on("mousedown", function(d,i,a) {mouse_is_down = true; })
		.on("mouseup", function(d, i, a) {mouse_is_down = false;});

                   
	var path = d3.geoPath()
	.projection(projection);
	
	// set the center of the map
	resetMapCenter();
	$(".legend_links_c").click(function() {
		
		$(".legend_links_c").removeClass( "selected_link" );
		$(this).addClass( "selected_link" );
	});
	if (map_item.map_of == "Canada") {
		// showing the country data
		showCountryGeoData(cur_year, 7, cur_country);
		d3.select("#slider-pips").style("display", "block");
		//show the country climate
		d3.json("data/CanadaMonthlyClimate.json", function(error, data) {
			
			climate_data = data;
			filterClimateDataMonthly(current_climate_filter);
			build_lines_all_climate();
			//get the total data for the country to make line charts
			getCountryTotalData(cur_country);
			
			//show the categories
			$(".cat_legend_link").show();
			$("#line_legend_holder").show();
			$("#toggle_line_legend").show();
			$(".legend_links").show();
			
			//change font color of selected text 
			$(".line_legend_links").click(function() {
				$(".line_legend_links").removeClass( "selected_link" );
				$(this).addClass( "selected_link" );
			});
			$(".cat_legend_link").click(function() {
				$(".cat_legend_link").removeClass( "selected_link" );
				$(this).addClass( "selected_link" );
			});

		});
	} else if (map_item.map_of == "world") {
		d3.select("#pie_chart_svg").remove();
		d3.select("#pie_legend").html("");
		// showing the country data
		//showCountryGeoData(cur_year, 7, cur_country);
		d3.select("#slider-pips").style("display", "none");
		//show the country climate
		d3.json("data/world_climate_data.json", function(error, data) {

			world_climate_data = data;
			filterClimateDataMonthly(current_climate_filter);
			build_world_lines_all_climate();
			//build_lines_data();
			//getCountryTotalData(cur_country);
			
			// hide the categories
			$(".cat_legend_link").hide();
			$("#line_legend_holder").hide();
			$("#toggle_line_legend").hide();
			$(".legend_links").hide();
			
		});
	}
	
	
	
 	d3.json(map_json, function(error, world) {
		
		 map_group = d3.selectAll('g.map-group').selectAll("append")
			.data(function(d, i) {
					if (map_item.map_of == "world") 
					{
						// add the plot bin svg group
						svg.selectAll(".plot_circle").remove();
						svg.selectAll(".plot_bin").remove();
						
						svg.append("g").attr("class", "squares plot_bin");
						return topojson.feature(world, world.objects.countries).features;
					}
					else if (map_item.map_of == "Canada") 
					{
						svg.selectAll(".plot_bin").remove();
						return topojson.feature(world, world.objects.collection).features;
					}
				})
			.enter()
			.append("path")
			.attr("d", path)
			.attr("class", function(d,i) {
					if (d.properties != null && d.properties.CODE != null) {
						return d.properties.CODE;
					} else {
						return "world" + d.id;
					}
				})
			.attr("stroke", "rgba(255, 255, 255, 0.25)")
			.on("mouseover", function(d, i, a) { 
				d3.select(this).attr("stroke-width", 5.5);
				tooltip.transition()			
						.style("opacity", .9)
						.duration(100);
						
				tooltip.html("<p>Click for details</p>")	
						.style("left", (d3.event.pageX - 50) + "px")		
						.style("top", (d3.event.pageY - 75) + "px");
			})
			.on("mouseout", function() {
				d3.select(this).attr("stroke-width", 1);
				tooltip.transition()			
						.style("opacity", 0)
						.duration(100);
			})
			.on("click", function(d, i, a) { 
				//mouse_is_down = true;
				var clicked = d3.select(this).node().getBBox();
				
				var bbox = bBoxMercator(clicked);
				
				var id = parseInt(d.id);
				
				if (d.properties.CODE != null) {
					id = parseInt(d.properties.CODE.substring(2));
				}
				
				details.transition()			
						.style("opacity", .9)
						.duration(100);	
				
				if (map_item.map_of == "world" && country_id[id] != null && country_id[id].map_of in country_maps && country_maps[country_id[id].map_of] != null) {
				
					details.html("<p>Country: " + country_id[d.id].map_of + "</p>"
								+"<p>"+ climate_to_text[current_climate_filter]
								+ " " + cur_year 
								+ ": " + formatDecimalComma(current_climate_data[d.id].value)
								+ " " + climate_unit_to_text[current_climate_filter] + "</p>"
								+"<a href='#' class='drilldown id_" + id + "'"  +
					"onClick=\'buildMap(country_maps[country_id[" + id + "].map_of], country_id[" + id + "])\'" +
					" class=\'close_details\'>view</a>"
					+ "<p onClick='closeDetails(details)' class='close_details'>close</p>")	
						.style("left", (d3.event.pageX) + "px")		
						.style("top", (d3.event.pageY - 75) + "px");
						
				}
				if (map_item.map_of == "Canada" && map_item.name != d.properties.NAME) {
					
					
					
					var item = new MapItem(map_item.map_of, d.properties.NAME, bbox.scale, bbox.center, map_item.id);
					var months_text = "";
					if (end_month - start_month < 2) {
						months_text = " for <br/>" + month_to_text[start_month];
					} else {
						months_text = " for period<br/>" + month_to_text[start_month] + " through " + month_to_text[end_month-1];
					}
					
					details.html("<p>Region: " + d.properties.NAME + "</p>"
								+"<p>"+ climate_to_text[current_climate_filter]
								+ months_text 
								+ ": " + formatDecimalComma(current_climate_data[d.properties.CODE].value)
								+ " " + climate_unit_to_text[current_climate_filter] + "</p>"
								+ "<p onClick='closeDetails(details)' class='close_details'>close</p>")	
						.style("left", (d3.event.pageX) + "px")		
						.style("top", (d3.event.pageY - 75) + "px");
					
				}
				
			})
			.on("mouseover", function(d, i, a) { 
				d3.select(this).attr("stroke-width", 5.5);
			})
			.on("mouseout", function() {
				d3.select(this).attr("stroke-width", 1);
			})
			.attr("fill", function(d, i) { 
				//if (d.id == 124) {return "red"} else {return colour(i);
				if (map_item.map_of == "Canada" && current_climate_data[d.properties.CODE] !== undefined) {
				
					return current_climate_data[d.properties.CODE].color;
					
				} else {
					//
					if (d.id != null && d.id in current_climate_data && current_climate_data[d.id] != null) {
						return current_climate_data[d.id].color;
					} else {
						return "black";
					}
				}
			} );
			
	});
	
 }
 	
// close the details popup with the close button
function closeDetails(element) {
	element.transition()			
			.style("opacity", 0)
			.duration(100);
			
	element.html("")
		.style("left", "0 px")		
		.style("top", "0 px");
					
					
}

// no longer used, but this will build the canada map
function buildCanada() {buildMap(country_maps["Canada"], "Canada");}
	
	
//from here https://stackoverflow.com/questions/1038727/how-to-get-browser-width-using-javascript-code
function getWidth() {
	return Math.max(
	document.body.scrollWidth,
	document.documentElement.scrollWidth,
	document.body.offsetWidth,
	document.documentElement.offsetWidth,
	document.documentElement.clientWidth
	);
}

// gets the height
function getHeight() {
	return Math.max(
	document.body.scrollHeight,
	document.documentElement.scrollHeight,
	document.body.offsetHeight,
	document.documentElement.offsetHeight,
	document.documentElement.clientHeight
	);
}

// map_item objects have name:string, scale:float (width/scale), center:[float, float] to center on map
// var map_item = {name:"Canada", scale:5, center:[0, 0]};
function MapItem(map_of, name, scale, center, id) {
	this.map_of = map_of;
  this.name = name;
  this.scale = scale;
  this.center = center;
  this.id = id;
}

// returns a bbox w/ center
function bBoxMercator(svgRect) {
	var bbox = {};
	var xy = invertMercator(svgRect.x, svgRect.y);
	var xy2 = invertMercator(svgRect.x + svgRect.width, svgRect.y + svgRect.height);
	
	bbox["north"] = xy[1];
	bbox["west"] = xy[0];
	bbox["south"] = xy2[1];
	bbox["east"] = xy2[0];
	bbox["center"] = [(xy2[0] + xy[0])/2, (xy[1] + xy2[1])/2]; 
	
	if (svgRect.width < svgRect.height) {
		bbox["scale"] = Math.abs(bbox["north"] - bbox["south"])/20.0;
	} else {
		bbox["scale"] = Math.abs(bbox["east"] - bbox["west"])/20.0;
	}
	
	bbox["scale"]
	return bbox;
	
}

	
// gets latlon points for xy points
function invertMercator(x, y) {
  //return [x, Math.log(Math.tan(Math.PI / 4 + y / 2))];
  return projection.invert([x,y]);
}

// gets latlon points for xy points
function toMercator(x, y) {
  //return [x, Math.log(Math.tan(Math.PI / 4 + y / 2))];
  return projection([x,y]);
}

// zooms back out
function zoomBack() {
	legend_svg.selectAll("g.legend").remove();
	resetMapCenter();
	buildMap(world_map, world_item);
	getWorldData();
}

//set the center to the center of the group
function resetMapCenter(){
	var group = svg.selectAll("g.map-group");
	var offsetX = parseFloat(group.attr("x"))+
				  parseFloat(group.attr("width")/2.0);
	var offsetY = parseFloat(group.attr("y"))+
				  parseFloat(group.attr("height")/2.0);
	current_center = [offsetX, offsetY];
}



function recenterMap(mouse_center) {
	if (clicked_mouse_down != null) {
		var mouse = invertMercator(mouse_center[0], mouse_center[1]);
		var cmd = invertMercator(clicked_mouse_down[0], clicked_mouse_down[1]);
		var difx = mouse[0] - cmd[0];
		var dify = mouse[1] - cmd[1];
		//clicked_mouse_down = mouse_center;
		current_map_item.center[0] -= difx;
		current_map_item.center[1] -= dify;
		buildMap(country_maps[current_map_item.map_of], current_map_item);
		
	}
	
}


//Create the drag and drop behavior to set for the objects crated
function dragstarted(d) {
	//clicked_mouse_down = [d3.event.x, d3.event.y];
	d3.select(this).raise().classed("active", true);
	
}

function dragged(d) {
	if (clicked_mouse_down != null) {
		var group = svg.selectAll("g.map-group");
  	d3.select(this)
		.attr("cx", d3.event.x).attr("cy", d3.event.y);

    	clicked_mouse_down = [d3.event.x, d3.event.y];
    } else {
    	clicked_mouse_down = [d3.event.x, d3.event.y];
    }
    
    
}

// when drag ends
function dragended(d) {
  d3.select(this).classed("active", false);
}

// when a nouislider pip is clicked
function clickOnPip ( ) {
	var value = Number(this.getAttribute('data-value'));
	pipsSlider.noUiSlider.set(value);
}

// filter json by date
function filterByDate(json) {
	result = [];
	for (j in json) {
		if (json[j].month >= start_month && json[j].month < end_month) {
			result.push(json[j]);
		}
	}
	
	return result;
}

// filter the butterfly data by month
function filterByMonthClass() {
	months = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'm10', 'm11', 'm12'];
	for (var i=0; i<months.length; i++) {
		var m = "." + months[i];
		if (i+1 >= start_month && i+1 < end_month) {
			svg.selectAll(m)
			.classed('hide', false);
		} else {
			svg.selectAll(m)
			.classed('hide', true);
		}
	}
	
}

// filters the climate data either by month or year, depending on map
function filterClimateDataMonthly(value) {
	current_climate_data = {};
	//current_climate_data = {};
	if (current_map_item.map_of == "world") {
		// first get min and maxes
		var vals = {};
		var legend_min, legend_max;
	
		if (value == 'Tx') {
		colour = d3.scaleLinear()
				.domain([world_min["Tx"], world_max["Tx"]]);
			legend_min = world_min["Tx"];
			legend_max = world_max["Tx"];
		} else if (value == 'Tm') {
		colour = d3.scaleLinear()
				.domain([world_min["Tm"], world_max["Tm"]]);
			legend_min = world_min["Tm"];
			legend_max = world_max["Tm"];
		} else if (value == 'Tn') {
		colour = d3.scaleLinear()
				.domain([world_min["Tn"], world_max["Tn"]]);
			legend_min = world_min["Tn"];
			legend_max = world_max["Tn"];
		} else if (value == 'P') {
		colour = d3.scaleLinear()
				.domain([world_min["P"], world_max["P"]]);
			legend_min = world_min["P"];
			legend_max = world_max["P"];
		} 
		colour.range(climate_color_range);
		
		// break out this year's climate
		for (c in world_climate_data) {
		
			if (world_climate_data[c].year == cur_year) {
				current_climate_data[world_climate_data[c].iso] = {'color': colour(world_climate_data[c][value]), value: world_climate_data[c][value]};
		
			}
		}
		
		for (code in current_climate_data) {
			
			d3.selectAll(".world" + code).attr("fill", current_climate_data[code].color);
			
		}
	

		climate_details.html("<p>" + current_map_item.map_of + "</p>"
									+"<p>"+ climate_to_text[current_climate_filter]
									+" (" + climate_unit_to_text[current_climate_filter] + ")"
									+ " for " + cur_year
									+ "</p>"
									+ legend_min + "<div id='climate_grad'> </div>" + legend_max);
		d3.select("#climate_grad")
			.style("background", "linear-gradient(to right, " + climate_color_range[0] + " , " + climate_color_range[1] + ")");
	
		
	} else {
		// first get min and maxes
		var vals = {};
		var legend_min, legend_max;
	
		if (value == 'Tx' || value == 'Tm' || value == 'Tn') {
		colour = d3.scaleLinear()
				.domain([TEMP_MIN, TEMP_MAX]);
			legend_min = TEMP_MIN;
			legend_max = TEMP_MAX;
		} else if (value == 'P') {
		colour = d3.scaleLinear()
				.domain([PREC_MIN, PREC_MAX]);
			legend_min = PREC_MIN;
			legend_max = PREC_MAX;
		} else if (value == 'S') {
		colour = d3.scaleLinear()
				.domain([SNOW_MIN, SNOW_MAX]);
			legend_min = SNOW_MIN;
			legend_max = SNOW_MAX;
		}
		colour.range(climate_color_range);

		//if the span is 1 month, just do normal, otherwise get the max/min/total/avg for all
		
		if (end_month - start_month <= 1) {
			for (c in climate_data) {
		
				if (climate_data[c].year == cur_year && climate_data[c].month >= start_month && climate_data[c].month < end_month) {
					
					current_climate_data[climate_data[c].code] = {'color': colour(climate_data[c][value]), value: climate_data[c][value]};
			
				}
			}
		} else {
	
			for (c in climate_data) {
		
				if (climate_data[c].year == cur_year && climate_data[c].month >= start_month && climate_data[c].month < end_month) {
					
					if (vals[climate_data[c].code] != null && vals[climate_data[c].code].length > 0) {
						vals[climate_data[c].code].push(climate_data[c][value]);
					} else {
						vals[climate_data[c].code] = [climate_data[c][value]];
					}
				}
			}
			var newvals = {};
			for (c in vals) {
				if (value == 'Tx') {
					newvals[c] = Math.max.apply(Math, vals[c]);
				} else if (value == 'Tm') {
					newvals[c] = vals[c].reduce(function(total, num){ return total + num }, 0)/vals[c].length;
				} else if (value == 'Tn') {
					newvals[c] = Math.min.apply(Math, vals[c]);
				} else {
					newvals[c] = vals[c].reduce(function(total, num){ return total + num }, 0);
				}
			}
		
			// for newvals:
			for (c in newvals) {
		
				current_climate_data[c] = {'color': colour(newvals[c]), value: newvals[c]};

			}
		

		}
	
		for (code in current_climate_data) {
			d3.selectAll("." + code).attr("fill", current_climate_data[code].color);
		}
	
		// change the display text
		var months_text = "";
		if (end_month - start_month < 2) {
			months_text = " for <br/>" + month_to_text[start_month];
		} else {
			months_text = " for period<br/>" + month_to_text[start_month] + " through " + month_to_text[end_month-1];
		}
		climate_details.html("<p>Country: " + current_map_item.map_of + "</p>"
									+"<p>"+ climate_to_text[current_climate_filter]
									+"(" + climate_unit_to_text[current_climate_filter] + ")"
									+ months_text 
									+ "</p>"
									+ legend_min + "<div id='climate_grad'> </div>" + legend_max);
	
		d3.select("#climate_grad")
			.style("background", "linear-gradient(to right, " + climate_color_range[0] + " , " + climate_color_range[1] + ")");
	}
}

// called when the user changes the climate value to visualize
function recolorMap(value) {
	current_climate_filter = value;
	filterClimateDataMonthly(value);
}

// update the year
function yearChange(direction) {
	if (direction == 'next') {
		cur_year += 1;
		document.getElementById("year_prev").innerHTML = cur_year -1;
 		document.getElementById("year_next").innerHTML = cur_year +1;
 		document.getElementById("year_display").innerHTML = "" +cur_year;
 		if (current_map_item.map_of == "world") {
 			getWorldData();
 		} else {
			showCountryGeoData(cur_year, 7, cur_country);
		}
	} else {
		cur_year -= 1;
		document.getElementById("year_prev").innerHTML = cur_year -1;
 		document.getElementById("year_next").innerHTML = cur_year +1;
 		document.getElementById("year_display").innerHTML = "" +cur_year;
		if (current_map_item.map_of == "world") {
 			getWorldData();
 		} else {
			showCountryGeoData(cur_year, 7, cur_country);
		}
	}
	moveDateSpanLines();
}

// build world lines 
// has to clear all lines first
function build_world_lines_all_climate() {
	d3.selectAll(".lc_path").remove();
	d3.selectAll(".lc_start_year").remove();
	d3.selectAll(".lc_start_month").remove();
	d3.selectAll(".lc_end_year").remove();
	d3.selectAll(".lc_end_month").remove();
	d3.selectAll(".line_chart_group").remove();
	d3.selectAll("g.line_graph_dots").remove();
	d3.selectAll("g.line_data_group").remove();
	line_graph_transforms = null;
	
	
	var data = filter_world_line_climate_data(world_climate_data, current_map_item.map_of);

	for (iso in data) {
		for (key in data[iso]) {
			line_x_dict[key] = d3.scaleTime()
				.rangeRound([0, w-25]);
			line_y_dict[key] = d3.scaleLinear()
				.rangeRound([line_height, 0]);
			
			var line = d3.line()
				.curve(d3.curveBasis)
				.x(function(d) { return line_x_dict[key](parseYear(d.year)); })
				.y(function(d) { return line_y_dict[key](d.value); });
			line_x_dict[key].domain(d3.extent(data[iso][key], function(d) { return parseYear(d.year); }));
			line_y_dict[key].domain([world_min[key], world_max[key]]);
	
			var lines_climate_g;
			var group_y_label = "";
			if (key == "Tx") {
				lines_climate_g = lines_Tx.append("g")
					.attr("class", "line_chart_group line_Tx_group")
					.attr("transform", "translate(25, 0)");
					group_y_label = "Max Temp (C)";
			} else if (key == "Tm") {
				lines_climate_g = lines_Tm.append("g")
					.attr("class", "line_chart_group line_Tm_group")
					.attr("transform", "translate(25, 0)");
					group_y_label = "Mean Temp (C)";
			}
			 else if (key == "Tn") {
				lines_climate_g = lines_Tn.append("g")
					.attr("class", "line_chart_group line_Tn_group")
					.attr("transform", "translate(25, 0)");
					group_y_label = "Min Temp (C)";
			}
			 else if (key == "P") {
				lines_climate_g = lines_P.append("g")
					.attr("class", "line_chart_group line_P_group")
					.attr("transform", "translate(25, 0)");
					group_y_label = "Precipitation (mm)";
			} else if (key == "S") {
				lines_climate_g = lines_S.append("g")
					.attr("class", "line_chart_group line_S_group")
					.attr("transform", "translate(25, 0)");
					group_y_label = "Snow (cm)";
			} else {
				continue;
			}
	
			lines_climate_g.append("path")
			  .datum(data[iso][key])
			  .attr("class", "lc_path " + data[iso].country + " " + climate_to_text[key])
			  .attr("fill", "none")
			  .attr("stroke", "steelblue")
			  .attr("stroke-linejoin", "round")
			  .attr("stroke-linecap", "round")
			  .attr("stroke-width", 1.5)
			  .attr("d", line)
			  .on("mouseover", function(d,i,a) { 
				line_details.html("<p>" + d3.select(this).attr("class") + "</p>")	
							.style("left", (d3.event.pageX) + "px")		
							.style("top", (d3.event.pageY - 75) + "px");
							
				line_details.transition()			
						.style("opacity", .9)
						.duration(100);	
			})
			.on("mouseout", function(d, i, a) { 
				line_details.transition()			
						.style("opacity", 0)
						.duration(100);	
			});
			
			xAxis[key] = d3.axisBottom(line_x_dict[key]);
		  	yAxis[key] = d3.axisLeft(line_y_dict[key]);
		  
	  
			  group_x[key] = lines_climate_g.append("g")
				  .attr("transform", "translate(0," + 85 + ")")
				  .call(xAxis[key]);
				 
			  	
			  if (key == "P") {
			  	group_y[key] = lines_climate_g.append("g")
			  		.call(yAxis[key].ticks(4).tickFormat(d3.formatPrefix(".0", 1e3)));
			  } else {
			  	group_y[key] = lines_climate_g.append("g")
			  		.call(yAxis[key].ticks(4));
			  }
				  //.call(d3.axisLeft(y).ticks(4))
				group_y[key].append("text")
				  .attr("fill", "#000")
				  .attr("transform", "rotate(-90)")
				  .attr("y", 6)
				  .attr("dy", "0.71em")
				  .attr("dx", "1px")
				  .attr("text-anchor", "end")
				  .text(group_y_label);
	  
			// draw a vertical line
			lines_climate_g.append("line")
				.attr("x1", line_x_dict[key](parseYear(cur_year)))  //<<== change your code here
				.attr("y1", 0)
				.attr("x2", line_x_dict[key](parseYear(cur_year)))  //<<== and here
				.attr("y2", line_height)
				.attr("class", "lc_start_year")
				.style("stroke-width", 2)
				.style("stroke", "red")
				.style("fill", "none");
		
			// draw a vertical line
			lines_climate_g.append("line")
				.attr("x1", line_x_dict[key](parseYear(cur_year+1)))  //<<== change your code here
				.attr("y1", 0)
				.attr("x2", line_x_dict[key](parseYear(cur_year+1)))  //<<== and here
				.attr("y2", line_height)
				.attr("class", "lc_end_year")
				.style("stroke-width", 2)
				.style("stroke", "red")
				.style("fill", "none");
		}
	}
}

function build_world_lines_all_climate_prev() {
	d3.selectAll(".lc_path").remove();
	d3.selectAll(".lc_start_year").remove();
	d3.selectAll(".lc_start_month").remove();
	d3.selectAll(".lc_end_year").remove();
	d3.selectAll(".lc_end_month").remove();
	
	
	
	var data = filter_world_line_climate_data(world_climate_data, current_map_item.map_of);
	
	var x = d3.scaleTime()
		.rangeRound([0, w-25]);
	var y = d3.scaleLinear()
		.rangeRound([line_height, 0]);

	var line = d3.line()
		.curve(d3.curveBasis)
		.x(function(d) { return x(parseYear(d.year)); })
		.y(function(d) { return y(d.value); });
	
	for (iso in data) {
		
		for (key in data[iso]) {
			if (!setup) {
			x.domain(d3.extent(data[iso][key], function(d) { return parseYear(d.year); }));
			y.domain(d3.extent(data[iso][key], function(d) { return d.value; }));
			}
		
		}
	}
}


function filterClimateDataWorld(data) {

}

//////// line charts
function build_lines_all_climate() {
	d3.selectAll(".lc_path").remove();
	d3.selectAll(".lc_start_year").remove();
	d3.selectAll(".lc_start_month").remove();
	d3.selectAll(".lc_end_year").remove();
	d3.selectAll(".lc_end_month").remove();
	d3.selectAll(".line_chart_group").remove();
	var height = 100;

	
	var data = filter_line_climate_data(climate_data, current_map_item.map_of);
	
	for (key in data) {
		
		line_x_dict[key] = d3.scaleTime()
 		.rangeRound([0, w-25]);
		line_y_dict[key] = d3.scaleLinear()
		.rangeRound([height, 0]);
		
		
		var line = d3.line()
			.curve(d3.curveBasis)
			.x(function(d) { return line_x_dict[key](parseTime(d.month)); })
			.y(function(d) { return line_y_dict[key](d.value); });
		line_x_dict[key].domain(d3.extent(data[key], function(d) { return parseTime(d.month); }));
		line_y_dict[key].domain(d3.extent(data[key], function(d) { return d.value; }));
	
		var lines_climate_g;
		var group_y_label = "";
		if (key == "Tx") {
			lines_climate_g = lines_Tx.append("g")
				.attr("class", "line_chart_group line_Tx_group")
				.attr("transform", "translate(25, 0)");
				group_y_label = "Max Temp (C)";
		} else if (key == "Tm") {
			lines_climate_g = lines_Tm.append("g")
				.attr("class", "line_chart_group line_Tm_group")
				.attr("transform", "translate(25, 0)");
				group_y_label = "Mean Temp (C)";
		}
		 else if (key == "Tn") {
			lines_climate_g = lines_Tn.append("g")
				.attr("class", "line_chart_group line_Tn_group")
				.attr("transform", "translate(25, 0)");
				group_y_label = "Min Temp (C)";
		}
		 else if (key == "P") {
			lines_climate_g = lines_P.append("g")
				.attr("class", "line_chart_group line_P_group")
				.attr("transform", "translate(25, 0)");
				group_y_label = "Precipitation (mm)";
		} else if (key == "S") {
			lines_climate_g = lines_S.append("g")
				.attr("class", "line_chart_group line_S_group")
				.attr("transform", "translate(25, 0)");
				group_y_label = "Snow (cm)";
		} else {
			continue;
		}
	
		lines_climate_g.append("path")
		  .datum(data[key])
		  .attr("class", "lc_path")
		  .attr("fill", "none")
		  .attr("stroke", "steelblue")
		  .attr("stroke-linejoin", "round")
		  .attr("stroke-linecap", "round")
		  .attr("stroke-width", 1.5)
		  .attr("d", line);
		  
		  xAxis["data"] = d3.axisBottom(line_x_dict[key]);
		  yAxis["data"] = d3.axisLeft(line_y_dict[key]);
	  
		  group_x["data"] = lines_climate_g.append("g")
			  .attr("transform", "translate(0," + 85 + ")")
			  .call(xAxis["data"]);
	

		  group_y["data"] = lines_climate_g.append("g")
			  //.call(d3.axisLeft(line_y))
			  .call(yAxis["data"]);
			group_y["data"].append("text")
			  .attr("fill", "#000")
			  .attr("transform", "rotate(-90)")
			  .attr("y", 6)
			  .attr("dy", "0.71em")
			  .attr("text-anchor", "end")
			  .text(group_y_label);
	  
		// draw a vertical line
		lines_climate_g.append("line")
			.attr("x1", line_x_dict[key](parseTime(cur_year+"-"+start_month)))  //<<== change your code here
			.attr("y1", 0)
			.attr("x2", line_x_dict[key](parseTime(cur_year+"-"+start_month)))  //<<== and here
			.attr("y2", line_height)
			.attr("class", "lc_start_month")
			.style("stroke-width", 2)
			.style("stroke", "red")
			.style("fill", "none");
		
		// draw a vertical line
		lines_climate_g.append("line")
			.attr("x1", line_x_dict[key](parseTime(cur_year+"-"+end_month)))  //<<== change your code here
			.attr("y1", 0)
			.attr("x2", line_x_dict[key](parseTime(cur_year+"-"+end_month)))  //<<== and here
			.attr("y2", line_height)
			.attr("class", "lc_end_month")
			.style("stroke-width", 2)
			.style("stroke", "red")
			.style("fill", "none");
	}


}

function build_lines_data(data, show) {
	var parseDate = d3.timeParse("%Y-%m-%d");


	// get the colours for the categories
	for (typecat in data) {
		if (typecat == "total") {
			continue;
		}
		for (cat in data[typecat]) {
			var t = -1;
			if (typecat == "family") {
				t = family_list.indexOf(cat)/family_list.length;
			} else if (typecat == "species") {
				t = species_list.indexOf(cat)/species_list.length;
			} else if (typecat == "genus") {
				t = genus_list.indexOf(cat)/genus_list.length;
			}
			
			if (t > -1) {
				categories_colors[cat] = d3.interpolateWarm(t);
			} else {
				categories_colors[cat] = "black";
			}
			
		}
	}
	
	
	//var data = getCountryTotalData("CA");
	line_x_dict["data"] = line_x;
	line_y_dict["data"] = line_y;
	
	d3.selectAll("g.line_graph_dots").remove();
	d3.selectAll("g.line_data_group").remove();
	
	var lines_data_g = lines_data.append("g")
	.attr("class", "line_data_group")
	.attr("transform", "translate(25, 0)");
	
	// append the actual lines
	// if total, just one line, otherwise lots of lines
	if (show == "total") {
		drawLineLegend([]);
		var line = d3.line()
			.curve(d3.curveBasis)
			.x(function(d) { return line_x_dict["data"](parseDate(d.date)); })
			.y(function(d) { return line_y_dict["data"](d.value); });
		
		line_x_dict["data"].domain(d3.extent(data["total"], function(d) { return parseDate(d.date); }));
		line_y_dict["data"].domain(d3.extent(data["total"], function(d) { return d.value; }));
		
		
	
		lines_data_g.append("path")
		  .datum(data["total"])
		  .attr("class", "lc_path")
		  .attr("fill", "none")
		  .attr("stroke", "green")
		  .attr("stroke-linejoin", "round")
		  .attr("stroke-linecap", "round")
		  .attr("stroke-width", 1.5)
		  .attr("d", line)
		  .on("mouseover", function(d,i,a) { 
				line_details.html("<p>Total Occurrences</p>")	
							.style("left", (d3.event.pageX) + "px")		
							.style("top", (d3.event.pageY - 75) + "px");
							
				line_details.transition()			
						.style("opacity", .9)
						.duration(100);	
			})
			.on("mouseout", function(d, i, a) { 
				line_details.transition()			
						.style("opacity", 0)
						.duration(100);	
			});
		
	} else {
		drawLineLegend(Object.keys(data[show]));
		// this will be a loop of each line
 		line_x.domain(d3.extent(data["total"], function(d) { return parseDate(d.date); }));  		
 		//line_y.domain(d3.extent(data["total"], function(d) { return d.value; }));
 		line_y.domain([0, 50]);

		var max = 0;
		for (i in data[show]) {
			
			var famname = "<p>" + i + "</p>";
			
			
			// dots for plot
			lines_data_g.append("g").attr("class", "line_graph_dots");
			d3.select(".line_graph_dots").selectAll("dot")
				.data(data[show][i])
			  .enter().append("circle")
			  	.attr("class", "line_plot_dot line_plot_" + i.replace(/\s/g, ""))
				.attr("r", 1)
				.attr("cx", function(d) { return line_x_dict["data"](parseDate(d.date)); })
				.attr("cy", function(d) { return line_y_dict["data"](d.value); })
				.attr("fill", function (d) {
						return categories_colors[i];
				  })
				.on("mouseover", function(d) { 
						if (d3.select(this).style("opacity") > 0.5) {
							var classes = d3.select(this).attr("class").split("_");
							var famlabel = classes[classes.length-1];
							line_details.html("<p>"+famlabel+"</p><p>"+d.date+"</p><p>"+d.value+"</p>")	
										.style("left", (d3.event.pageX) + "px")		
										.style("top", (d3.event.pageY - 75) + "px");
							
							line_details.transition()			
									.style("opacity", .9)
									.duration(100);	
						}	
					})
					.on("mouseout", function(d) { 
						if (d3.select(this).style("opacity") > 0.5) {
							line_details.transition()			
									.style("opacity", 0)
									.duration(100);	
						}
					});
				if (line_graph_transforms != null)
					d3.select(".line_graph_dots").attr("transform", line_graph_transforms);
			}

		
	}
	
		xAxis["data"] = d3.axisBottom(line_x_dict["data"]);
		  yAxis["data"] = d3.axisLeft(line_y_dict["data"]);
      
      group_x["data"] = lines_data_g.append("g")
		  .attr("transform", "translate(0," + 85 + ")")
		  .call(xAxis["data"])
		  //.call(d3.axisBottom(line_x))
		//.select(".domain")
		  //.remove();
	//.tickValues([0, 10, 20, 30, 40, 50])
	  group_y["data"] = lines_data_g.append("g")
	  	.call(yAxis["data"].ticks(5));
		  //.call(d3.axisLeft(line_y).ticks(5))
		group_y["data"].append("text")
		  .attr("fill", "#000")
		  .attr("transform", "rotate(-90)")
		  .attr("y", 6)
		  .attr("dy", "0.71em")
		  .attr("text-anchor", "end")
		  .text("Total Occurances");
      
	// draw a vertical line
	lines_data_g.append("line")
		.attr("x1", line_x_dict["data"](parseTime(cur_year+"-"+start_month)))  
		.attr("y1", 0)
		.attr("x2", line_x_dict["data"](parseTime(cur_year+"-"+start_month)))  
		.attr("y2", line_height)
		.attr("class", "lc_start_month")
		.style("stroke-width", 2)
		.style("stroke", "red")
		.style("fill", "none");
		
	// draw a vertical line
	lines_data_g.append("line")
		.attr("x1", line_x_dict["data"](parseTime(cur_year+"-"+end_month)))  
		.attr("y1", 0)
		.attr("x2", line_x_dict["data"](parseTime(cur_year+"-"+end_month)))  
		.attr("y2", line_height)
		.attr("class", "lc_end_month")
		.style("stroke-width", 2)
		.style("stroke", "red")
		.style("fill", "none");
		
		
		
		// color the total text
		// $("#line_legend_total").mouseenter(function(){
//     		$(this).css("color", "#fc7a1e");
//     	}).mouseleave(function(){
//     		$(this).css("color", "#99212d");
//     	});
//         $("#line_legend_total").css("color", "#f9212d");
        
        

}

// update the line on the line chart
function updateLineChart() {

}

// decide what to display on the map
// might be interesting to get several year's worth of data here?
//(start_y, end_y, start_m, end_m, region)
function filter_line_climate_data(data, region) {
	var line_Tx_data = {};
	var line_P_data = {};
	var line_Tm_data = {};
	var line_Tn_data = {};
	var line_S_data = {};
	if (region == current_map_item.map_of) {
		for (c in climate_data) {
			var date = climate_data[c].year + "-0" + climate_data[c].month;
			if (climate_data[c].month > 9) {
				date = climate_data[c].year + "-" + climate_data[c].month;
			}
			if (line_Tx_data[date] === undefined) {
				line_Tx_data[date] = [climate_data[c].Tx];
			} else {
				line_Tx_data[date].push(climate_data[c].Tx);
			}
			
			if (line_Tm_data[date] === undefined) {
				line_Tm_data[date] = [climate_data[c].Tm];
			} else {
				line_Tm_data[date].push(climate_data[c].Tm);
			}
			
			if (line_Tn_data[date] === undefined) {
				line_Tn_data[date] = [climate_data[c].Tn];
			} else {
				line_Tn_data[date].push(climate_data[c].Tn);
			}
			
			if (line_S_data[date] === undefined) {
				line_S_data[date] = [climate_data[c].S];
			} else {
				line_S_data[date].push(climate_data[c].S);
			}
			if (line_P_data[date] === undefined) {
				line_P_data[date] = [climate_data[c].P];
			} else {
				line_P_data[date].push(climate_data[c].P);
			}

		}
	}
	
	
	
	
	var line_Tx_data_binned = [];
	var line_P_data_binned = [];
	var line_Tm_data_binned = [];
	var line_Tn_data_binned = [];
	var line_S_data_binned = [];
	for (m in line_Tx_data) {
		
		val = Math.max.apply(Math, line_Tx_data[m]);
		line_Tx_data_binned.push({'month':m, 'value': val});
		
		valP = line_P_data[m].reduce(function(total, num){ return total + num }, 0);
		line_P_data_binned.push({'month':m, 'value': valP});
		
		valS = line_S_data[m].reduce(function(total, num){ return total + num }, 0);
		line_S_data_binned.push({'month':m, 'value': valS});
		
		valTm = Math.max.apply(Math, line_Tm_data[m]);
		valTm = line_Tm_data[m].reduce(function(total, num){ return total + num }, 0)/line_Tm_data[m].length;
		line_Tm_data_binned.push({'month':m, 'value': valTm});
		
		valTn = Math.min.apply(Math, line_Tn_data[m]);
		line_Tn_data_binned.push({'month':m, 'value': valTn});
		
	}
	
	line_Tx_data_binned.sort(compare);
	line_Tn_data_binned.sort(compare);
	line_Tm_data_binned.sort(compare);
	line_S_data_binned.sort(compare);
	line_P_data_binned.sort(compare);
	
	var all = {"Tx": line_Tx_data_binned, "Tn": line_Tn_data_binned, "Tm": line_Tm_data_binned, "S": line_S_data_binned, "P": line_P_data_binned}; 
	
	return all;
	
	

}

// filter data for the world
function filter_world_line_climate_data(data, region) {
	var country_lines = {};
	//for each country, make a series of lines
	for (c in data) {
		if (data[c].iso in country_lines && country_lines[data[c].iso] != null) {
			country_lines[data[c].iso]["Tx"].push({"year": data[c].year, "value": data[c].Tx}); 
			country_lines[data[c].iso]["Tm"].push({"year": data[c].year, "value": data[c].Tm});
			country_lines[data[c].iso]["Tn"].push({"year": data[c].year, "value": data[c].Tn});
			country_lines[data[c].iso]["P"].push({"year": data[c].year, "value": data[c].P});
		} else {
			country_lines[data[c].iso] = {
				"Tx": [{"year": data[c].year, "value": data[c].Tx}], 
				"Tn": [{"year": data[c].year, "value": data[c].Tn}], 
				"Tm": [{"year": data[c].year, "value": data[c].Tm}], 
				"P": [{"year": data[c].year, "value": data[c].P}],
				"country": data[c].country
			};
		}
	}
	return country_lines;
	
}

// bin butterfly data for line graph
function binLineData(data) {
	
	var species_bins = {};
	var genus_bins = {};
	var family_bins = {};
	var total_bins = {};
	
	for (i in data) {
		//2015-08-05T02:00Z 
		var date = data[i]["d"].split("T")[0];
		
		var value = 1;

		
		// making the genus day bins
		if (species_bins[data[i].s + "=" + date] === undefined) {
			species_bins[data[i].s + "=" + date] = 1;
		} else {
			species_bins[data[i].s + "=" + date]++;
		}
		
		// making the genus day bins
		if (genus_bins[data[i].g + "=" + date] === undefined) {
			genus_bins[data[i].g + "=" + date] = 1;
		} else {
			genus_bins[data[i].g + "=" + date]++;
		}

		// making the family day bins
		if (family_bins[data[i].f + "=" + date] === undefined) {
			family_bins[data[i].f + "=" + date] = 1;
		} else {
			family_bins[data[i].f + "=" + date]++;
		}
		
		// making the total day bins
		if (total_bins[date] === undefined) {
			total_bins[date] = value;
		} else {
			total_bins[date] += value;
		}
	}
	
	
	// now make it work for a line graph
	// TODO - better way to do this?
	var total = [];
	total.push({"date":"2014-01-01", "value": 0});
// 	total.push({"date":"2018-01-01", "value": 0});
	for (d in total_bins) {
		total.push({"date":d, "value": total_bins[d]});
	}
	
	// set up the family chart data
	var fam = {};
	for (f in family_bins) {
		
		var word = f.split("=");
		var family = word[0];
		var date = word[1];
		
		if (fam[family] === undefined) {
			fam[family] = [{'date': date, 'value': family_bins[f]}];
		} else {
			fam[family].push({'date': date, 'value': family_bins[f]});
			
		}
		fam[family].sort(compareDate);
	}
	
	// set up the genus chart data
	var gen = {};
	for (g in genus_bins) {
		
		var word = g.split("=");
		var genus = word[0];
		var date = word[1];
		
		if (gen[genus] === undefined) {
			gen[genus] = [{'date': date, 'value': genus_bins[g]}];
		} else {
			gen[genus].push({'date': date, 'value': genus_bins[g]});
			
		}
		gen[genus].sort(compareDate);
	}
	
	// set up the genus chart data
	var spe = {};
	for (s in species_bins) {
		
		var word = s.split("=");
		var species = word[0];
		var date = word[1];
		
		if (spe[species] === undefined) {
			spe[species] = [{'date': date, 'value': species_bins[s]}];
		} else {
			spe[species].push({'date': date, 'value': species_bins[s]});
			
		}
		spe[species].sort(compareDate);
	}
	
	total.sort(compareDate);

	
	all_groups = {"total": total, "family": fam, "species": spe, "genus": gen};
	return all_groups;
	

	
}

// for sorting climate data
function compare(a,b) {
  if (a.month < b.month)
	return -1;
  if (a.month > b.month)
	return 1;
  return 0;
}

// for sorting climate data
function compareDate(a,b) {
  
  if (a.date < b.date)
	return -1;
  if (a.date > b.date)
	return 1;
  return 0;
}

Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
}

// moves the vertical lines on the line chart
function moveDateSpanLines() {
	
	if (current_map_item.map_of == "world") {
		d3.selectAll(".lc_start_year")
			.attr("x1", line_x_dict["Tx"](parseTime(cur_year+"-01")))
			.attr("x2", line_x_dict["Tx"](parseTime(cur_year+"-01")));
		d3.selectAll(".lc_end_year")
			.attr("x1", line_x_dict["Tx"](parseTime((cur_year+1)+"-01")))
			.attr("x2", line_x_dict["Tx"](parseTime((cur_year+1)+"-01")));
	} else {
		d3.selectAll(".lc_start_month")
			.attr("x1", line_x_dict["data"](parseTime(cur_year+"-"+start_month)))
			.attr("x2", line_x_dict["data"](parseTime(cur_year+"-"+start_month)));
		d3.selectAll(".lc_end_month")
			.attr("x1", line_x_dict["data"](parseTime(cur_year+"-"+end_month)))
			.attr("x2", line_x_dict["data"](parseTime(cur_year+"-"+end_month)));
	}
		
}