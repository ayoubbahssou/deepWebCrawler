<?php 
$templateScript = "phantom.js";
$templateFileCopy = "phantomcopy.js";

if (!copy($templateScript, $templateFileCopy)) {
	die ("failed to copy $templateFileCopy");
}

$url=$_GET['url'];
$configObj = file_get_contents($templateFileCopy);
$configObj = 'var url ="'.$url.'";' . $configObj;

file_put_contents($templateFileCopy,$configObj);
exec("phantomjs phantomcopy.js 2>&1", $output);

if ( !unlink( $templateFileCopy ) ) {
	die("failed to delete $templateFileCopy");
}

?>
<p><?php $output ?></p>
<img src="avant1.png" height="800" width="900" alt=""> </br>
<img src="apres1.png" height="800" width="900" alt="">
