function msg(x) {
	
	var $ol = document.getElementById('debug'),
	$li = document.createElement('li');
	$li.innerHTML = String(x);
	$ol.appendChild($li);
	
	if (typeof console !== 'undefined') console.warn(x);
	
}