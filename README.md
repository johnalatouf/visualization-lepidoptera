# lepidoptera
Geospatial butterfly and moth data visualization using HTML + JavaScript, D3, Python
Created for CSCI 4166 Visualization Project

-----------------------------------------------------------------------------------------

Description:

This visualization system displays Butterfly and Moth collection data from 
multiple (listed below) sources with historical climate data.

-----------------------------------------------------------------------------------------

Requirements:

The system requires a server (MAMP, WAMP, etc is fine) and a connection to the internet.

You will need Python 2.7 and the following Python libraries to run:
Pandas (https://pandas.pydata.org/)
Numpy (http://www.numpy.org/)

It looks best in Chrome, tested in Firefox and Safari as well

-----------------------------------------------------------------------------------------

Usage Instructions:

- Extract files to a folder accessible from your localhost
- Extract the data/butterflies_total.csv.zip file (this file is 349MB)
- With server running, open the index.html page

-----------------------------------------------------------------------------------------

How it works:

The JavaScript files:
js/proj/ajax_req.js - handles the Ajax request functions
js/proj/charts.js - holds the main chart functions and global vars
js/proj/legends.js - holds the legends functions
js/proj/piechart.js - holds the pie chart functions

The PHP and Python:
scripts/binned_data.php - called by Ajax, executes binned_data.py
scripts/binned_data.py - returns the binned geospatial data for the world map
scripts/country_geo.php - called by Ajax, executes country_geo.py
scripts/country_geo.py - returns the country geospatial points
scripts/country_total.php - called by Ajax, executes country_line.py
scripts/country_line.py - returns the total collection information for a country


-----------------------------------------------------------------------------------------

References:

Butterfly Data:
iNaturalist. (2018) 'A community for Naturalists', iNaturalist.org. Available: http://www.inaturalist.org. Accessed: 10, February 2018
D. Roy (2017) 'UK Butterfly Monitoring Scheme (UKBMS)'. Global Biodiversity Information Facility. https://www.gbif.org/dataset/1e266c3d-92ef-4d5a-8e4a-c04742c772c3. Accessed: 10, February 2018
Natur Gucker. (2018). Naturgucker.com. Available: http://naturgucker.de/ Accessed: 10, February 2018
R. Avery. (2012) 'OEH Atlas of NSW Wildlife'.  Global Biodiversity Information Facility. https://www.gbif.org/dataset/0645ccdb-e001-4ab0-9729-51f1755e007e. Accessed: 10, February 2018

Inspiration for this project:
L. Ries, J. Glassberg, B. Fagan, J. Jaja, M. Smorul, J. Sauer. (2012) 'Butterfly Informatics: Access, Visualization, and Analysis of Butterfly Monitoring Data', TheButterflyNetwork.org. Available: http://www.thebutterflynetwork.org/sites/default/files/natureserve_and_defenders-bfly_only.pdf. Accessed: 10, February 2018

Mat Data:
M. Bostock. (2017) 'world-atlas@1.1.4', Unpkg.com. Available: https://unpkg.com/world-atlas@1.1.4/world/. Accessed: 10, April 2018
Madigan. (2013) 'SIG-Map'. GitHub. Available: https://github.com/mdgnkm/SIG-Map. Accessed: 8, April 2018

Climate Data:
Government of Canada. (2018) 'Historical Climate Data', Government of Canada. Available: http://climate.weather.gc.ca/. Accessed: 10, February 2018
'National Centers for Environmental Information'. (2018) National Oceanic and Atmospheric Administration. Available: https://www.ncdc.noaa.gov/. Accessed: 10, February 2018
'Environment'. (2018) The World Bank. Available: https://data.worldbank.org/topic/environment. Accessed: 10, February 2018

Useful Widgets:
W3Schools. (2018) 'How to - CSS Loader'. W3Schools. Available: https://www.w3schools.com/howto/howto_css_loader.asp. Accessed: 8, April 2018
L. Gersen. (2004) 'noUiSlider'. noUiSlider. Available: https://refreshless.com/nouislider/. Accessed: 8, April 2018
