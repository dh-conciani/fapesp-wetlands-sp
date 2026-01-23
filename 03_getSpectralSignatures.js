// training samples

var years = [2024];

// GT com métricas já calculadas (export calculos morfométricos)
var gtPolys = ee.FeatureCollection("projects/ee-deisejunqueira/assets/ManuscriptPolygons_metrics");

// Bacia / AOI
var bacia = ee.FeatureCollection("projects/ee-deisejunqueira/assets/BaciaCorumbatai");
var aoi = bacia.geometry();

// Hidrografia (seu asset)
var riversFC = ee.FeatureCollection("projects/ee-deisejunqueira/assets/Ughri05_hidrografia")
  .filterBounds(aoi);

// Embeddings
var embeddingsIC = ee.ImageCollection('GOOGLE/SATELLITE_EMBEDDING/V1/ANNUAL');

// MapBiomas (Coleção 10)
//var mb = ee.Image('projects/mapbiomas-public/assets/brazil/lulc/collection10/mapbiomas_brazil_collection10_coverage_v2');

var stable = ee.Image('projects/ee-ipam-cerrado/assets/Collection_11/masks/cerrado_trainingMask_1985_2024_v4')

// read palette
var vis = {
    'min': 0,
    'max': 62,
    'palette': require('users/mapbiomas/modules:Palettes.js').get('classification8')
};

Map.addLayer(stable, vis, 'stable pixels mapbiomas');


// ======================================================================
// 2) VARIÁVEIS TOPO (RASTER): SRTM + HAND MERIT
// ======================================================================
var srtm = ee.Image('USGS/SRTMGL1_003').clip(aoi);
var elevation = srtm.rename('elevation');
var slope = ee.Terrain.slope(srtm).rename('slope');

var meanElev = srtm.focal_mean({radius: 250, units: 'meters'});
var tpi = srtm.subtract(meanElev).rename('tpi');

// HAND REAL (MERIT Hydro) — usado no RF pixel e nas métricas por polígono
var handImg = ee.Image("MERIT/Hydro/v1_0_1").select("hnd").rename("hand").clip(aoi);

// ======================================================================
// 3) DISTÂNCIA A RIOS (RASTER) — usado no RF pixel e nas métricas por polígono
// ======================================================================
var riversRaster = ee.Image(0).byte().paint(riversFC, 1).rename("rivers").clip(aoi);
var distRiversImgBase = riversRaster
  .fastDistanceTransform(1000).sqrt()
  .multiply(30)
  .rename('dist_river')
  .clip(aoi);

//Map.addLayer(distRiversImgBase, {palette: ['green', 'yellow', 'red'], min:1, max:500}, 'distRivers')

