
var im;

clone = require('clone');
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
				filename = image.key.replace(new RegExp(path.extname(image.key)+'$'),'-'+size.name+'$&');
				output.push({
					src: image.key,
					dest: filename,
					size: size
				});
			});
		});

		async.each(output, function(image, done){
			sharp(data[image.src].contents)
				.resize(image.size.width, image.size.height)
				.withoutEnlargement()
				.toBuffer(function(err, outputBuffer, info) {

					if (err) {
					  throw err;
					}
					data[image.dest] = clone(data[image.src]);
					data[image.dest].contents = outputBuffer;
					done();
				});
		}, function(){
			done()
		});
	}

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
