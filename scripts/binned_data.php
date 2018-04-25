
<?php


    // get the parameters from the ajax call
    // call the python to make the json
    $data_path = $_POST["data_path"];
    $country = $_POST["country"];
    $year = $_POST["year"];


	$cmd = 'python '. 'binned_data.py' .' '. escapeshellarg($data_path) . ' ' . escapeshellarg($year);
    //echo $cmd
    exec($cmd . " 2>&1", $out, $status);
	echo implode($out);
?>