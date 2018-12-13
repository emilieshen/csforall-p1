google.charts.load('current', {
  packages: ['geochart', 'table'],
  mapsApiKey: 'AIzaSyCwaJ8jKQm9PJpO0NBaaYOEWknOBwOVbS8',
})

let dataset;
let currentYear;
let currentType;
let currentState
let currentDataSet

const columnIds = {
  Type: 0,
  Date: 1,
  Name: 2,
  State: 3,
}

function getStateName(code) {
  const states = {
    'AZ': 'Arizona',
    'AL': 'Alabama',
    'AK': 'Alaska',
    'AZ': 'Arizona',
    'AR': 'Arkansas',
    'CA': 'California',
    'CO': 'Colorado',
    'CT': 'Connecticut',
    'DE': 'Delaware',
    'FL': 'Florida',
    'GA': 'Georgia',
    'HI': 'Hawaii',
    'ID': 'Idaho',
    'IL': 'Illinois',
    'IN': 'Indiana',
    'IA': 'Iowa',
    'KS': 'Kansas',
    'KY': 'Kentucky',
    'KY': 'Kentucky',
    'LA': 'Louisiana',
    'ME': 'Maine',
    'MD': 'Maryland',
    'MA': 'Massachusetts',
    'MI': 'Michigan',
    'MN': 'Minnesota',
    'MS': 'Mississippi',
    'MO': 'Missouri',
    'MT': 'Montana',
    'NE': 'Nebraska',
    'NV': 'Nevada',
    'NH': 'New Hampshire',
    'NJ': 'New Jersey',
    'NM': 'New Mexico',
    'NY': 'New York',
    'NC': 'North Carolina',
    'ND': 'North Dakota',
    'OH': 'Ohio',
    'OK': 'Oklahoma',
    'OR': 'Oregon',
    'PA': 'Pennsylvania',
    'RI': 'Rhode Island',
    'SC': 'South Carolina',
    'SD': 'South Dakota',
    'TN': 'Tennessee',
    'TX': 'Texas',
    'UT': 'Utah',
    'VT': 'Vermont',
    'VA': 'Virginia',
    'WA': 'Washington',
    'WV': 'West Virginia',
    'WI': 'Wisconsin',
    'WY': 'Wyoming',
  }

  return states[code.replace('US-', '')]
}

function initializeMap() {
  var queryString = encodeURIComponent('SELECT A, B, C, E');

  // Get data
  var query = new google.visualization.Query(
      'https://docs.google.com/spreadsheets/d/1XONDdLAKdfOrYYBscCus8CCwHwTsPxxuer3E6ctxzuw/gviz/tq?gid=158515577&headers=1&tq=' + queryString);
  query.send(handleQueryResponse);
}

function groupByStates(data) {
  const groupedData = google.visualization.data.group(
    data,
    [columnIds.State],
    [{column: columnIds.State, aggregation: google.visualization.data.count, type: 'number'}]
  )

  groupedData.setColumnLabel(1, 'Members')
  groupedData.removeRow(0)

  return groupedData
}

function groupByType(data) {
  const groupedData = google.visualization.data.group(
    data,
    [columnIds.Type],
  )

  return groupedData
}

function populateTypes(data) {
  const types = groupByType(data)
  const typeElement = document.getElementById('type')
  for (let i = 0; i < types.getNumberOfRows(); i++) {
    const type = types.getValue(i, 0)
    const option = document.createElement('option')
    option.value = type
    option.innerHTML = type
    typeElement.appendChild(option)
  }

  const allOption = document.createElement('option')
  allOption.value = 'All'
  allOption.innerHTML = 'All'

  typeElement.appendChild(allOption)
}

function handleQueryResponse(response) {
  if (response.isError()) {
    alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
    return;
  }

  var data = response.getDataTable();

  data.sort([{column: columnIds.State}, {column: columnIds.Name}])

  dataSet = data

  drawRegionsMap(data)
  populateTypes(data)
}

function drawTable(data) {
  if (!currentState) {
    return
  }
  const state = getStateName(currentState)
  const filteredData = new google.visualization.DataView(data)
  const selectedRows = filteredData.getFilteredRows([{column: columnIds.State, value: state}])

  filteredData.setRows(selectedRows)
  filteredData.setColumns([columnIds.Name, columnIds.Type, columnIds.Date])

  const table = new google.visualization.Table(document.getElementById('list'))

  table.draw(filteredData, {width: '100%'})
}

function drawRegionsMap(data) {
  var options = {
    region: 'US',
    resolution: 'provinces',
    colorAxis: {colors: ['#b7dbf2', '#1c599c']},
  };

  var chart = new google.visualization.GeoChart(document.getElementById('map'));

  google.visualization.events.addListener(chart, 'regionClick', ({region}) => {
    currentState = region
    drawTable(data)
  })
  chart.draw(groupByStates(data), options);
}

google.charts.setOnLoadCallback(initializeMap)

function filterData() {
  const filteredData = new google.visualization.DataView(dataSet)

  const filters = []

  if (currentYear) {
    filters.push({
      column: columnIds.Date,
      minValue: new Date(currentYear, 1, 1),
      maxValue: new Date(currentYear, 12, 31),
    })
  }

  if (currentType) {
    filters.push({
      column: columnIds.Type,
      value: currentType,
    })
  }

  if (filters.length === 0) {
    return filteredData
  }

  const selectedRows = filteredData.getFilteredRows(filters)
  filteredData.setRows(selectedRows)

  return filteredData
}

function refreshViews() {
  const data = filterData()
  drawRegionsMap(data)
  drawTable(data)
}

document.getElementById('year').addEventListener('change', (e) => {
  currentYear = e.target.value === 'All' ? undefined : e.target.value
  refreshViews()
})

document.getElementById('type').addEventListener('change', (e) => {
  currentType = e.target.value === 'All' ? undefined : e.target.value
  refreshViews()
})
