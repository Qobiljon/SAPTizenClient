var statusText;
var connectButton;
var appStatus = false;
var appVibrate = false;
var documentsDir;

function startHeartRateCollection() {
	appStatus = true;
	tizen.ppm.requestPermission("http://tizen.org/privilege/healthinfo", function() {
		tizen.humanactivitymonitor.start('HRM', function(hrmInfo) {
			var timestamp = new Date().getTime();
			if (hrmInfo.heartRate > 0 && hrmInfo.rRInterval > 0) {
				appVibrate = false;
				appendLine(DataSource.TIZEN_RR_INTERVAL + "," + timestamp + "," + hrmInfo.rRInterval);
				appendLine(DataSource.TIZEN_HR + "," + timestamp + "," + hrmInfo.heartRate);
			} else if (hrmInfo.heartRate <= 0) {
				tizen.application.launch("WGvCVP8H7a.SAPTizenClient");
				if (!appVibrate) {
					appVibrate = true;
					navigator.vibrate(700);
				}
			}
		});
		console.log('HRM started');
	}, function(error) {
		console.log('failed to start HRM, permission error : ' + error.message);
	});
}

window.onload = function() {
	window.addEventListener('tizenhwkey', function(ev) {
		if (ev.keyName === "back") {
			var page = document.getElementsByClassName('ui-page-active')[0], pageid = page ? page.id : "";
			if (pageid === "main") {
				try {
					if (appStatus) {
						// window.webapis.motion.stop("HRM");
						tizen.application.getCurrentApplication().hide();
					} else {
						tizen.power.release("CPU");
						tizen.power.release("SCREEN");

						tizen.application.getCurrentApplication().exit();
					}
				} catch (ignore) {
				}
			} else {
				window.history.back();
			}
		}
	});

	// bind views
	statusText = document.getElementById("status_text");
	connectButton = document.getElementById("connect_button");
	setConnectionStatusHTML(false);

	// connect to the android agent
	connect();

	// hold the CPU lock
	tizen.power.request("CPU", "CPU_AWAKE");
	tizen.power.request("SCREEN", "SCREEN_NORMAL");

	// acquire permissions and start data collection
	tizen.ppm.requestPermission("http://tizen.org/privilege/mediastorage", function() {
		// console.log('permission acquired');
		tizen.filesystem.resolve("documents", function(dir) {
			documentsDir = dir;
			// console.log('dir resolved : ' + dir.path);
			dir.listFiles(function(files) {
				console.log(files.length + ' files in "documents" dir');
			}, null);
			createNewFile(function() {
				startHeartRateCollection();
			}, function() {
				alert('Failed to create a file for storing data!');
			});
		}, function(error) {
			console.log('resolve error : ' + error.message);
		}, "rw");
	}, function(error) {
		console.log('resolve permission error : ' + error.message);
	});

	tizen.power.setScreenStateChangeListener(function(oldState, newState) {
		if (newState !== "SCREEN_BRIGHT" || !tizen.power.isScreenOn()) {
			tizen.power.turnScreenOn();
			// tizen.power.setScreenBrightness(1);
		}
	});
};

function aboutClick() {
	alert("It collects health and behavioral data for a stress sensing study. Have a nice day =)");
}

function setConnectionStatusHTML(status) {
	if (status) {
		statusText.style.color = '#2ecc71';
		statusText.innerHTML = 'BT : CONNECTED';
		connectButton.style.display = "none";
	} else {
		statusText.style.color = 'red';
		statusText.innerHTML = 'BT : DISCONNECTED';
		connectButton.style.display = "block";
	}
}

function exitApp() {
	tizen.application.getCurrentApplication().exit();
}