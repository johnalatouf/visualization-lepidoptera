
<?php


    // get the parameters from the ajax call
    // call the python to make the json
    $data_path = $_POST["data_path"];
    $country = $_POST["country"];
    $year = $_POST["year"];
    $month = $_POST["month"];

	
	$cmd = 'python '. 'country_geo.py' .' '. escapeshellarg($year) . ' ' . escapeshellarg($month) . ' ' . escapeshellarg($country) . ' ' . escapeshellarg($data_path);
    //echo $cmd
    exec($cmd . " 2>&1", $out, $status);
	echo implode($out);
?>