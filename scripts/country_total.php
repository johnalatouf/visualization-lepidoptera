
<?php


    // get the parameters from the ajax call
    // call the python to make the json
    $data_path = $_POST["data_path"];
    $country = $_POST["country"];


	$cmd = 'python '. 'country_line.py' . ' ' . escapeshellarg($country) . ' ' . escapeshellarg($data_path);
    //echo $cmd
    exec($cmd . " 2>&1", $out, $status);
	echo implode($out);
?>