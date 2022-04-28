function activeLink(e) {
    if (document.querySelector('#navList a.active') !== null) {
      document.querySelector('#navList a.active').classList.remove('active');
    }
    e.target.className = "active";
}

function showSpinner(){
    document.getElementById("analyzeBtn").style.display = "none";
    document.getElementById("loadingBtn").style.display = "block";
    document.getElementById("loadingBtn").disabled = true;
    document.getElementById("clearBtn").disabled = true;
    if(document.getElementById("PositiveResultStyle")){
        document.getElementById("PositiveResultStyle").style.display = "none";
        document.getElementById("NegativeResultStyle").style.display = "none";
        document.getElementById("plotyContainer").style.display = "none";
        document.getElementById("errorMsgEmotion").style.display = "none";
    }
    document.getElementById("errorMsg").style.display = "none";
}

function hideSpinner(){
    document.getElementById("clearBtn").disabled = false;
    document.getElementById("analyzeBtn").style.display = "block";
    document.getElementById("loadingBtn").style.display = "none";
}

function clearContent()
{
    document.getElementById("msgToAnalyze").value='';
    document.getElementById("PositiveResultStyle").style.display = "none";
    document.getElementById("NegativeResultStyle").style.display = "none";
    document.getElementById("errorMsgEmotion").style.display = "none";
    document.getElementById("errorMsg").style.display = "none";
}

let likeOrDislike;
function plotlyBarDataPrep(result){
    hideSpinner();
    let val; 
    const data = result[0];
    const negPercentage = data.filter(function (e) {
        return e.label == "NEGATIVE";
    })[0].score * 100;
    const posPercentage = data.filter(function (e) {
        return e.label == "POSITIVE";
    })[0].score * 100;

    if(posPercentage > negPercentage){
        val = 'positive'
    }else{
        val = 'negative'
    }
    likeOrDislike = val;

    if (window.location.href.indexOf('review') == -1){
        if(val === 'positive'){
            document.getElementById("PositiveResultStyle").style.display = "block";
            document.getElementById("NegativeResultStyle").style.display = "none";
        }else{
            document.getElementById("NegativeResultStyle").style.display = "block";
            document.getElementById("PositiveResultStyle").style.display = "none";
        }
    }
    showPlotlyChart(posPercentage,negPercentage);
}

function showPlotlyChart(posPercentage,negPercentage){
    let data = [
        {
          x: ['Positive', 'Negative'],
          y: [posPercentage, negPercentage],
          type: 'bar',
          marker: {
            color: ['#bbedbe','#eb5e6c'],
            line: {
                width: 2.5
            }
          }
        }
      ];
      const layout = {
        height: 500,
        title: 'Plotly Bar Chart <br>Sentiment Analysis of your message'
      };

      const config = {responsive: true}

      if (window.location.href.indexOf('review') == -1){
        document.getElementById("plotyContainer").style.display = "block";
        Plotly.newPlot('plotlyBar', data, layout, config);
      }else{
        Plotly.newPlot('plotlyBar_likeDislike', data, layout, config);
      }
}

function plotlyPieData(result){
    let labelList = [];
    let valueList = [];
    for(let i =0; i < result[0].length; i++){
        labelList.push(result[0][i].label);
        valueList.push((result[0][i].score) * 100);
    }
    let data = [{
        values: valueList,
        labels: labelList,
        type: 'pie'
    }]
    const layout = {
        height: 500,
        title: 'Plotly Pie Chart <br>Emotions behind your message'
      };
    const config = {responsive: true}

    Plotly.newPlot('plotlyPie', data, layout, config);
}

function handleEmotionErrorMsg(){
    document.getElementById("errorMsgEmotion").style.display = "block";
}

function cleanAndAnalyze(){
    cleanDate();
}

function cleanDate(){
    showSpinner();
    console.log('cleanDate')
    let msg = document.getElementById("msgToAnalyze").value;
    fetch('http://127.0.0.1:5000/dataCleaning', {
        method: "POST",
        body: msg,
        headers: {
            "Access-Control-Allow-Origin" : 'http://127.0.0.1:5000/dataCleaning',
            "Access-Control-Allow-Methods" : '*',
            "Access-Control-Allow-Headers" : '*'
        }
    })
    .then(response => response.text())
    .then(data => {
        console.log('Success:', data);
        if(data){
            document.getElementById("errorMsg").style.display = "none";
            document.getElementById("cleanMsg").innerHTML = data;
            analyzeContent(data);
            analyzeEmotion(data);
        }else{
            document.getElementById("errorMsg").style.display = "block";
            hideSpinner();
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        document.getElementById("errorMsg").style.display = "block";
    });
}

async function analyzeContent(msg){
    showSpinner();
    fetch('http://127.0.0.1:5000/sentiment', {
        method: "POST",
        body: msg,
        headers: {
            "Access-Control-Allow-Origin" : 'http://127.0.0.1:5000/sentiment',
            "Access-Control-Allow-Methods" : '*',
            "Access-Control-Allow-Headers" : '*'
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        plotlyBarDataPrep(data);
        hideSpinner()
    })
    .catch((error) => {
        console.error('Error:', error);
        //display error message
        hideSpinner()
    });
}

async function analyzeEmotion(msg){
    fetch('http://127.0.0.1:5000/emotion', {
        method: "POST",
        body: msg,
        headers: {
            "Access-Control-Allow-Origin" : 'http://127.0.0.1:5000/emotion?data=',
            "Access-Control-Allow-Methods" : '*',
            "Access-Control-Allow-Headers" : '*'
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        plotlyPieData(data)
        hideSpinner()
    })
    .catch((error) => {
        console.error('Error:', error);
        handleEmotionErrorMsg()
        hideSpinner()
    });
}

// this is for review
let subCategory
function selectedItem(e){
    const items = document.querySelectorAll(".dropdown-menu li");
    for(let i = 0; i < items.length; i++)
    {
        items[i].onclick = function(i){
            subCategory = i.srcElement.innerHTML
            document.getElementById("selectionText").innerHTML = 'You have selected ' +  subCategory + ' to review'
        };
    }
}

function cleanDate_Rev(){
    showSpinner();
    console.log('cleanDate')
    let msg = document.getElementById("msgToAnalyze").value;
    fetch('http://127.0.0.1:5000/dataCleaning', {
        method: "POST",
        body: msg,
        headers: {
            "Access-Control-Allow-Origin" : 'http://127.0.0.1:5000/dataCleaning',
            "Access-Control-Allow-Methods" : '*',
            "Access-Control-Allow-Headers" : '*'
        }
    })
    .then(response => response.text())
    .then(data => {
        console.log('Success:', data);
        if(data){
            analyzeContent(msg);
            document.getElementById("errorMsg").style.display = "none";
            document.getElementById("cleanMsg").innerHTML = data;
            setTimeout(() => {
                analyzeStarRating(data);
            }, 100)
        }else{
            document.getElementById("errorMsg").style.display = "block";
            hideSpinner();
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        document.getElementById("errorMsg").style.display = "block";
    });
}

async function analyzeStarRating(msg){
    console.log('analyzeStarRating')
    //let msg = document.getElementById("msgToAnalyze").value;
    fetch('http://127.0.0.1:5000/star', {
        method: "POST",
        body: msg,
        headers: {
            "Access-Control-Allow-Origin" : 'http://127.0.0.1:5000/star',
            "Access-Control-Allow-Methods" : '*',
            "Access-Control-Allow-Headers" : '*'
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        addTableRow(msg,data);
        plotlyPieData_Rating(data);        
        hideSpinner();
    })
    .catch((error) => {
        console.error('Error:', error);
        hideSpinner();
    });
}


function createRowColumn(row) {
    const column = document.createElement("td");
    row.appendChild(column);
    return column;
}

let dataToStore = [];
let csv_result;
function addTableRow(msg,data) {
    const newrow = document.createElement("tr");
    let nameColumn = createRowColumn(newrow);
    let reviewColumn = createRowColumn(newrow);
    let ratingColumn = createRowColumn(newrow);
    let likeDislikeColumn = createRowColumn(newrow);
    let removeColumn = createRowColumn(newrow);

    //name of the product/tv show/ movie
    let name = document.createElement("span");
    name.setAttribute('id','product_name');
    name.innerHTML = subCategory;
    nameColumn.appendChild(name);

    //review of the product/tv show/ movie
    let review = document.createElement("span");
    review.setAttribute('id','product_review');
    review.innerHTML = msg;
    reviewColumn.appendChild(review);

    //star rating of the product/tv show/ movie based on the provided review
    let maxStarRating = data[0].reduce(function(a, b){
    if(a.score > b.score)
        return a;
        return b;
    });
    let rating = document.createElement("span");
    rating.setAttribute('id','product_maxstar');
    rating.innerHTML = maxStarRating.label;
    ratingColumn.appendChild(rating);

    //likeDislike
    let likeDislike = document.createElement("span");
    likeDislike.setAttribute('id','product_likeDislike');
    likeDislike.innerHTML = likeOrDislike;
    likeDislikeColumn.appendChild(likeDislike);

    //remove
    let remove = document.createElement("a");
    remove.setAttribute("value", "Delete Row");
    remove.setAttribute('href','#');
    remove.setAttribute("onclick", "deleteRow(this)");
    remove.innerHTML = "Delete this Row";
    removeColumn.appendChild(remove);

    let table = document.getElementById('tableReview');
    let tbody = table.querySelector('tbody') || table;
    let count = tbody.getElementsByTagName('tr').length +1 ;

    dataToStore.push({
        "name" : subCategory,
        "review" : msg,
        "start" : maxStarRating.label,
        "likeDislike": likeOrDislike
    })
    csv_result = createCSV(dataToStore)
    tbody.appendChild(newrow);
}

function deleteRow(button) {
  let row = button.parentNode.parentNode;
  let tbody = row.parentNode;
  tbody.removeChild(row);
  
  // refactoring numbering
  const rows = tbody.getElementsByTagName("tr");
  for (let i = 1; i < rows.length; i++) {
  	let currentRow = rows[i];
    currentRow.childNodes[0].innerText = i.toLocaleString() + '.';
  }
  
}


function plotlyPieData_Rating(result){
    let labelList = [];
    let valueList = [];
    for(let i =0; i < result[0].length; i++){
        labelList.push(result[0][i].label);
        valueList.push((result[0][i].score) * 100);
    }
    let data = [{
        values: valueList,
        labels: labelList,
        type: 'pie'
    }]
    const layout = {
        height: 300,
        title: 'Plotly Pie Chart - Details of your ratings'
      };
    const config = {responsive: true}

    Plotly.newPlot('plotlyPie_star', data, layout, config);
}

function createCSV(items) {
    let csv='';
    for(let row = 0; row < items.length; row++){
    let keysAmount = Object.keys(items[row]).length
    let keysCounter = 0

    // If this is the first row, generate the headings
    if(row === 0){
        // Loop each property of the object
        for(let key in items[row]){
            csv += key + (keysCounter+1 < keysAmount ? ',' : '\r\n' )
            keysCounter++
        }
        keysCounter = 0
    }
    for(let key in items[row]){
        csv += items[row][key] + (keysCounter+1 < keysAmount ? ',' : '\r\n' )
        keysCounter++
    }
    keysCounter = 0
    }
    return csv
}


  // Needs to be global
  function downloadCSV () {
    let hiddenElement = document.createElement('a');  
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv_result);  
    hiddenElement.target = '_blank';  
      
    //provide the name for the CSV file to be downloaded  
    hiddenElement.download = 'Review_sentiment.csv';  
    hiddenElement.click();  
  };
  
  
  