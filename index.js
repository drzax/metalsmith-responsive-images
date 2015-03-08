
var im;

im = require('im');
clone = require('clone');
toArray = require('stream-to-array');
stream = require('stream');
streamifier = require('streamifier');
concat = require('concat-stream');
async = require('async');
sharp = require('sharp');

module.exports = responsiveImagesFactory;

function responsiveImagesFactory(settings){

	return function responsiveImages(data, metalsmith, done) {

		var input, output;

		input = pairs(data).filter(isImage);
		output = [];

		input.forEach(function(image){
			settings.sizes.forEach(function(size){

				// filename = image.key.replace(/\/([^\/]*)$/, '/'+size.name+'-$1');
				filename = image.key.replace(new RegExp(path.extname(image.key)+'$'),'-'+size.name+'$&');
				output.push({
					src: image.key,
					dest: filename,
					size: size
				});
			});
		});

		async.each(output, function(image, done){
			sharp(data[image.src])
				.resize([image.size.width, image.size.height])
		}, function(){
			done()
		});
	}

}

function resize(imageBuffer, width, done) {
	var readStream, writeStream;

	readStream = streamifier.createReadStream(imageBuffer);
	writeStream = concat(function(buf){
		done(buf);
	});

	im(readStream)
		.resize(width)
		.convert(writeStream);
}


function isImage(file) {
	// console.log(path.extname(file.key));
	return ['jpg', 'jpeg', 'png', 'gif'].some(function(ext){
		return '.'+ext === path.extname(file.key);
	});
}

function pairs(obj) {
	return Object.keys(obj).map(function(key){
		return {key: key, value: obj[key]};
	});
}
