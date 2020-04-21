const
DataSource = {
	TIZEN_LOCATION : 31,
	TIZEN_RR_INTERVAL : 35,
	TIZEN_LIGHT_INTENSITY : 32,
	TIZEN_HAD_ACTIVITY : 33,
	TIZEN_HAD_SLEEP_PATTERN : 36,
	TIZEN_AMBIENT_LIGHT : 38,
	TIZEN_HR : 34,
	TIZEN_ACCELEROMETER : 37
}, fileHeader = "DATA_SOURCE_ID,TIMESTAMP,VALUES,...";
var newFileStream = null, oldFile = null;
var newFileStream1 = null;
var canWrite = false;
var timestamp;

function createNewFile(fileCreationCb, fileCreationErrorCb) {
	canWrite = false;
	timestamp = +new Date();
	if (newFileStream === null) {
		tizen.filesystem.resolve('documents/new.txt', function(file) {
			documentsDir.moveTo(file.fullPath, 'documents/' + timestamp + '.txt', true, function() {
				tizen.filesystem.resolve('documents/' + timestamp + '.txt', function(file) {
					file.openStream('w', function(fs) {
						fs.write(timestamp);
						fs.close();
						console.log('new.txt renamed to ' + timestamp  + '.txt');
					}, function(error) {
						console.log('openStream error : ' + error.message);
					});
				}, null);
				var newFile = documentsDir.createFile('new.txt');
				if (newFile !== null) {
					newFile.openStream("w", function(fs) {
						newFileStream = fs;
						fs.write(fileHeader + "\n");
						canWrite = true;
						if (fileCreationCb !== null) {
							fileCreationCb();
						}
					}, function(error) {
						console.log("openStream error : " + error.message + ', filename=new.txt');
						canWrite = false;
						if (fileCreationCb !== null) {
							fileCreationErrorCb();
						}
					}, "UTF-8");
				} else {
					console.log("failed to create new.txt");
					canWrite = false;
					if (fileCreationCb !== null) {
						fileCreationErrorCb();
					}
				}
			});
		}, function(error) {
			var newFile = documentsDir.createFile('new.txt');
			if (newFile !== null) {
				console.log("new.txt file created : " + newFile.fullPath);
				newFile.openStream("w", function(fs) {
					newFileStream = fs;
					fs.write(fileHeader + "\n");
					canWrite = true;
					if (fileCreationCb !== null) {
						fileCreationCb();
					}
				}, function(error) {
					console.log("openStream error : " + error.message + ', filename=new.txt');
					canWrite = false;
					if (fileCreationCb !== null) {
						fileCreationErrorCb();
					}
				}, "UTF-8");
			} else {
				console.log("failed to create new.txt");
				canWrite = false;
				if (fileCreationCb !== null) {
					fileCreationErrorCb();
				}
			}
		}, 'rw');
	} else {
		newFileStream.write(timestamp);
		newFileStream.close();
		documentsDir.moveTo('documents/new.txt', 'documents/' + timestamp + '.txt', true, function() {
			console.log('new.txt renamed to ' + timestamp  + '.txt');
			var newFile = documentsDir.createFile('new.txt');
			if (newFile !== null) {
				newFile.openStream("w", function(fs) {
					newFileStream = fs;
					fs.write(fileHeader + "\n");
					canWrite = true;
					if (fileCreationCb !== null) {
						fileCreationCb();
					}
				}, function(error) {
					console.log("openStream error : " + error.message + ', filename=new.txt');
					canWrite = false;
					if (fileCreationCb !== null) {
						fileCreationErrorCb();
					}
				}, "UTF-8");
			} else {
				console.log("failed to create new.txt");
				canWrite = false;
				if (fileCreationCb !== null) {
					fileCreationErrorCb();
				}
			}
		});
	}
}

function appendLine(line) {
	if (canWrite) {
		newFileStream.write(line + "\n");
	}
}

function submitFilesToAndroidAgent() {
	createNewFile(function() {
		documentsDir.listFiles(function(files) {
			for (var n = 0; n < files.length; n++) {
				if (files[n].name !== 'new.txt') {
					files[n].openStream('r', function(fs) {
						var data = '';
						while (fs.eof === false) {
							data += fs.read(100);
						}
						var fileName = data.substring(data.length - 13);
						data = data.substring(0, data.length - 13);
						if (sendMessage(data)) {
							documentsDir.deleteFile('documents/' + fileName + '.txt', function() {
								console.log('file ' + fileName + '.txt has been sent and deleted');
							}, function(error) {
								console.log('deleteFile error : ' + error.message);
							});
						}
					}, function(error) {
						console.log('openStream error : ' + error.message);
					});
				}
			}
		}, function(error) {
			console.log('listFiles error : ' + error.message);
		});
	}, null);

}
