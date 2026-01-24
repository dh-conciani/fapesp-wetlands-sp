// load collection
var embeddings = ee.Image('users/dh-conciani/wetlands-fapesp-sp/classification/depressaoPeriferica_classification_EMBEDDINGS_v2')
var sentinel = ee.Image('users/dh-conciani/wetlands-fapesp-sp/classification/depressaoPeriferica_classification_SENTINEL_v2')

// set years
var years = [2024];

// read palette
var vis = {
  'min': 0,
  'max': 62,
  'palette': require('users/mapbiomas/modules:Palettes.js').get('classification8')
};

years.forEach(function(year_i) {
  Map.addLayer(embeddings.select('classification_' + year_i), vis, 'embeddings ' + year_i)
  Map.addLayer(sentinel.select('classification_' + year_i), vis, 'sentinel ' + year_i);

});
