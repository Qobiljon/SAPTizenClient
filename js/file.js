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
var newFile = null, oldFile = null;
var canWrite = false;

function createNewFile(fileCreationCb, fileCreationErrorCb) {
	canWrite = false;
	if (newFile === null) {
		tizen.filesystem.resolve("documents/new.txt", function(file) {
			newFile = file;
			documentsDir.moveTo(newFile.fullPath, 'documents/old.txt', true, function() {
				newFile = documentsDir.createFile('new.txt');
				if (newFile !== null) {
					newFile.openStream("w", function(fs) {
						fs.write(fileHeader + "\n");
						console.log("new.txt copied to old.txt");
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
			newFile = documentsDir.createFile('new.txt');
			if (newFile !== null) {
				newFile.openStream("w", function(fs) {
					fs.write(fileHeader + "\n");
					console.log("new.txt file created : " + newFile.fullPath);
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
		documentsDir.moveTo(newFile.fullPath, 'documents/old.txt', true, function() {
			newFile = documentsDir.createFile('new.txt');
			if (newFile !== null) {
				newFile.openStream("w", function(fs) {
					fs.write(fileHeader + "\n");
					console.log("new.txt copied to old.txt");
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
		newFile.openStream("a", function(fs) {
			fs.write(line + "\n");
		}, function(e) {
			console.log("Error " + e.message);
		}, "UTF-8");
	}
}

function submitFilesToAndroidAgent() {
	createNewFile(function() {
		tizen.filesystem.resolve("documents/old.txt", function(file) {
			oldFile = file;
			file.openStream("r", function(fs) {
				var data = fs.read(oldFile.fileSize);
				if (sendMessage(data)) {
					console.log('file sent to android agent');
					documentsDir.deleteFile(oldFile.fullPath, function() {
						console.log('file deleted');
					}, function() {
						console.log('failed to delete the file : ' + files[n].fullPath);
					});
				} else {
					console.log('failed to send the file to android agent');
				}
			}, function(error) {
				console.log('openStream error : ' + error.message);
			});
		}, function(error) {
			console.log('resolve error : ' + error.message + ', filename=old.txt');
		});
	}, null);
}

/*
 * function submitFilesToAndroidAgent() { createNewFile();
 * 
 * tizen.filesystem.resolve('documents', function(dir) {
 * dir.listFiles(function(files) { for (var n = 0; n < files.length; n++) { if
 * (files[n] !== currentFile) { files[n].openStream('r', function(fileStream) {
 * var data = fileStream.readFile(files[n], 'utf-8'); if (sendMessage(data)) {
 * dir.deleteFile(files[n].fullPath, onFileDeteleSuccess, onFileDeleteError); }
 * alert('success'); }, function(error) { console.log('Failed to read a file : ' +
 * error.message); alert('failure 1'); }); } } }, function(error) {
 * console.log("The error " + error.message + " occurred when listing the files
 * in the selected folder"); alert('failure 2'); }); }, function(error) {
 * console.log('Failed to load files : ' + error.message); alert('failure 0'); },
 * 'rw'); }
 */
