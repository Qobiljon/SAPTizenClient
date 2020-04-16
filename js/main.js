var content_view = null;

window.onload = function() {
	content_view = document.getElementById("content_view");

	document.addEventListener('tizenhwkey', function(e) {
		if (e.keyName === "back") {
			try {
				tizen.application.getCurrentApplication().hide();
				alert('app is hidden');
			} catch (ignore) {
				console.log('problem with "back" button : ' + ignore);
			}
		}
	});

	var sendButton = document.getElementById('send_button');
	sendButton.addEventListener('click', function() {
		if (sendMessage('Hello')) {
			console.log('"Hello" sent to SAPAndroidClient');
		} else {

		}
	});

	if (SASocket === null) {
		connect();
	}
};

function printHTML(log_string) {
	content_view.innerHTML = log_string;
}
