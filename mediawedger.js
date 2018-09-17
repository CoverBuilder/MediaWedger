/*
  
  mediawedger.js
  
  A tool to create tone value patches from characterisation data in Adobe InDesign

  https://github.com/CoverBuilder/MediaWedger

  Bruno Herfst 2018

*/

var MediaWedger = {
    version: 0.1
};

var preset = {
    name: "Media Wedge for manual evaluation",
    startLocation: {x:0,y:0},
    patchSize: {width:6,height:6},
    wedgeShape: {width:24,height:3} 
};

MediaWedger.parseData = function( dataPath ) {

    var dataFile = new File( dataPath );
    if( dataFile ) {
        dataFile.open('r');
        var csv = "";
        while(!dataFile.eof) csv += dataFile.readln() + "\n";
        dataFile.close();
    } else {
        throw new Error("Could not read data.");
    };

    var data = [];
    var lines=csv.split("\n");
    var headers=lines[0].split(",");

    for(var i=1;i<lines.length;i++){
        var patch = {};
        var currentline=lines[i].split(",");

        for(var j=0;j<headers.length;j++){
          patch[headers[j]] = currentline[j];
        }

        data.push(patch);

    };

    return data;

};

MediaWedger.drawPatch = function( Spread, patchBounds, patchColor ) {
    var patch = Spread.rectangles.add(undefined,{geometricBounds:patchBounds, appliedObjectStyle: Spread.parent.objectStyles.item(0), fillColor:patchColor, strokeColor:"None"});
    patch.fillColor = patchColor;
};

MediaWedger.render = function( Spread, dataArr, preset ) {
    var currX = 0, currY = 0;
    currX += preset.startLocation.x;
    currY += preset.startLocation.y;
    var patchW = preset.patchSize.width;
    var patchH = preset.patchSize.height;
    var dataLen = dataArr.length;
    if( dataLen > (preset.wedgeShape.width * preset.wedgeShape.width) ) {
        throw new Error("Data does not fit inside the wedge, please create a wedge shape that can contain more patches.");
    };

    for(var dataI=0; dataI<dataLen-1; dataI++){
        if( dataI > 0 && dataI % preset.wedgeShape.width === 0 ) {
          currX = 0 + preset.startLocation.x;
          currY += patchH;
        };

        // [y1, x1, y2, x2]
        var patchBounds = [currY,currX,currY+patchH,currX+patchW];
        var patchColor = Spread.parent.colors.add({space: ColorSpace.CMYK});
        patchColor.colorValue = [parseFloat(dataArr[dataI].CMYK_C), parseFloat(dataArr[dataI].CMYK_M), parseFloat(dataArr[dataI].CMYK_Y), parseFloat(dataArr[dataI].CMYK_K)];

        // Let's create some patches!
        MediaWedger.drawPatch( Spread, patchBounds, patchColor );
        currX += patchW;
    };
};

MediaWedger.create = function( Spread, dataPath, preset ) {
    var data = MediaWedger.parseData( dataPath );
    MediaWedger.render( Spread, data, preset );
};

MediaWedger.create( app.documents.add().spreads[0], (new File($.fileName)).parent.absoluteURI + "/Data/Medienkeil3_Sollwerte_CSV/FOGRA39.csv", preset );

