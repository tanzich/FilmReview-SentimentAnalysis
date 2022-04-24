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
    document.getElementById("PositiveResultStyle").style.display = "none";
    document.getElementById("NegativeResultStyle").style.display = "none";
    document.getElementById("plotyContainer").style.display = "none";
    document.getElementById("errorMsgEmotion").style.display = "none";
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
}

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

    if(val === 'positive'){
        document.getElementById("PositiveResultStyle").style.display = "block";
        document.getElementById("NegativeResultStyle").style.display = "none";
    }else{
        document.getElementById("NegativeResultStyle").style.display = "block";
        document.getElementById("PositiveResultStyle").style.display = "none";
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
        width: 800,
        height: 500,
        title: 'Plotly Bar Chart based on the Sentiment Analysis of your message'
      };

      const config = {responsive: true}
      document.getElementById("plotyContainer").style.display = "block";
      document.getElementById("PositiveResultStyle").style.display = "none";
      Plotly.newPlot('plotlyBar', data, layout, config);
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
        width: 800,
        height: 500,
        title: 'Plotly Pie Chart based on the Emotions of your message'
      };
    const config = {responsive: true}

    Plotly.newPlot('plotlyPie', data, layout, config);
}

function handleEmotionErrorMsg(){
    document.getElementById("errorMsgEmotion").style.display = "block";
}

async function analyzeContent(){
    analyzeEmotion();
    let msg = document.getElementById("msgToAnalyze").value;
    console.log(msg);
    let entry = {
        message : msg
    };
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
    })
    .catch((error) => {
        console.error('Error:', error);
        //display error message
        hideSpinner()
    });
}

async function analyzeEmotion(){
    let msg = document.getElementById("msgToAnalyze").value;
    console.log(msg);
    let entry = {
        message : msg
    };
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
    })
    .catch((error) => {
        console.error('Error:', error);
        handleEmotionErrorMsg()
    });
}



