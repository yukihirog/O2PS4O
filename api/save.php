<?php

$path     = $_SERVER['DOCUMENT_ROOT'] . '/results/';
$web_path = 'http://localhost/results/';

$api_results = array(
	"status"  => FALSE,
	"message" => "",
	"_post" => $_POST,
	"_file" => $_FILES
);


ini_set('file_uploads', '1');

if (isset($_POST['filename']) && isset($_FILES['data'])) {
	$filename = $_POST['filename'];
	$data     = $_FILES['data'];

	$filename = mb_ereg_replace("/(\/|\.\.)/", '_', $filename);
	$save_filename = $path . $filename;

	if ($data['error'] == UPLOAD_ERR_OK) {
		$tmp_name = $data['tmp_name'];
		if (!is_uploaded_file($tmp_name)) {
			$api_results["message"] = "Error: Failed to upload file.";
		} else if (move_uploaded_file($tmp_name, $save_filename)) {
			chmod($save_filename, 0644);
			$web_filename  = $web_path . $filename;
			$api_results["status"]  = TRUE;
			$api_results["message"] = "success";
			$api_results["url"]     = $web_filename;
		} else {
			$api_results["message"] = "Error: Failed to move temp file.";
		}
	} else {
		$api_results["message"] = "Error: Failed to write file.";
	}
/*
	move_uploaded_file($tmp_name, $save_filename);

	if (file_put_contents($save_filename, $data, LOCK_EX)) {
		$web_filename  = $web_path . $filename;

		$api_results["status"]  = TRUE;
		$api_results["message"] = "success";
		$api_results["url"]     = $web_filename;
	} else {
		$api_results["message"] = "Error: Failed to write file.";
	}
*/
} else {
	$api_results["message"] = "Error: API requires 'filename' and 'data'.";
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($api_results);


?>