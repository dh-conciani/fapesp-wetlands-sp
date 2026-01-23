// training samples

// define string to use as metadata
var version = 1;

// define ibges' carta id
var file_name = 'baciaCorumbatai';

// define output dir
var output_dir = 'users/dh-conciani/wetlands-fapesp-sp/training/v1'


var years = [2024];

// carregar pontos
var samples = ee.FeatureCollection('users/dh-conciani/wetlands-fapesp-sp/baciaCorumbatai_samplePoints_v1');

// Bacia / AOI
var bacia = ee.FeatureCollection("projects/ee-deisejunqueira/assets/BaciaCorumbatai");

// Embeddings
var embeddingsIC = ee.ImageCollection('GOOGLE/SATELLITE_EMBEDDING/V1/ANNUAL');


// ======================================================================
// 2) VARIÁVEIS TOPO (RASTER): SRTM + HAND MERIT
// ======================================================================
var srtm = ee.Image('USGS/SRTMGL1_003').clip(bacia);
var elevation = srtm.rename('elevation');
var slope = ee.Terrain.slope(srtm).rename('slope');

var meanElev = srtm.focal_mean({radius: 250, units: 'meters'});
var tpi = srtm.subtract(meanElev).rename('tpi');

// HAND REAL (MERIT Hydro) — usado no RF pixel e nas métricas por polígono
var handImg = ee.Image("MERIT/Hydro/v1_0_1").select("hnd").rename("hand").clip(bacia);

// ======================================================================
// 3) DISTÂNCIA A RIOS (RASTER) — usado no RF pixel e nas métricas por polígono
// ======================================================================
// Hidrografia (seu asset)
var riversFC = ee.FeatureCollection("projects/ee-deisejunqueira/assets/Ughri05_hidrografia")
  .filterBounds(bacia);

var riversRaster = ee.Image(0).byte().paint(riversFC, 1).rename("rivers").clip(bacia);
var distRiversImgBase = riversRaster
  .fastDistanceTransform(1000).sqrt()
  .multiply(30)
  .rename('dist_river')
  .clip(bacia);

//Map.addLayer(distRiversImgBase, {palette: ['green', 'yellow', 'red'], min:1, max:500}, 'distRivers')

////////////////////////////
years.forEach(function(year_i) {

  // read mosaic for year i
  var emb_i = embeddingsIC.filterDate(year_i + '-01-01', year_i + '-12-30')
    .mosaic()
    .clip(bacia);

  // add terrain bands
  emb_i = emb_i.addBands([elevation, slope, tpi, handImg, distRiversImgBase]);
  
  // get training samples
  var training_i = emb_i.sampleRegions({'collection': samples,
                                         'scale': 10,
                                         'geometries': true,
                                         'tileScale': 2});
  
  // export as GEE asset
  Export.table.toAsset({'collection': training_i,
                      'description': file_name  + '_' + year_i + '_training_v' + version,
                      'assetId':  output_dir + '/' + file_name  + '_' + year_i + '_training_v' + version});
  
})

