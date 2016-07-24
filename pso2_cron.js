var client = require('cheerio-httpcli');
var fs = require('fs');
var mycron = require('cron').CronJob;

function findTopicid(page,callback){
	new Promise(function (resolve, reject) {
		client.fetch('http://pso2.jp/players/news/', {mode:"event", page:page}, function (err, $, res) {
			if(err) reject("pso2サイトおちてる");
			var getdata = [];
			$("#event dl dd").each(function (idx) {
				var title = $(this).children("dd a").text();
				var pageid = $(this).children("dd a").attr("href").slice(6);
				if(title.match('予告イベント情報！')){
					var date = title.slice(0, title.indexOf(" ～ "));
					//console.log(date + " : " + pageid);
					getdata.push([date,pageid]);
				}
			});
			console.log("finished");
			resolve(getdata);
		});
	}).then(function (value){
		callback(value);
	}).catch(function (error){
	    console.log(error);
	});
}
/*
var pageid = {
	"2016/7/13" : "9312",
	"2016/7/6" : "9123"
}
*/


function getKinkyu(id, callback){
	new Promise(function (resolve, reject) {
		client.fetch('http://pso2.jp/players/news/', { id: id }, function (err, $, res) {
			var Topictitle = $('.tabsWrap dl dd').text();
			console.log("title : "+Topictitle);
			var getdata = {};

			$('.tableWrap').each(function (idx) {
				//date: 予定日
				var date = $(this).prev().text();
				getdata[date] = new Array();
				//console.log(date);
				$(this).find('tr').each(function (idx) {
					//time:  緊急の開始時間
					//quest: イベントの名前
					//type:  イベントの種類(緊急,カジノ,チャレンジ,ネットカフェ)
					var time = $(this).children(".sub").text();
					var quest = $(this).children("td").not(".icon").text();
					var type = $(this).find("img").attr("alt");
					//console.log(time + " : " + quest + " " + type);
					if(time){getdata[date].push([type, time, quest]);}
				});
			});

			resolve(getdata);
			console.log("finished");
		});
    }).then(function (value){
		callback(value);
	}).catch(function (error){
	    console.log(error);
	});

}

/*
getKinkyu(9327,function(json){
	console.log(json + " test");
});
*/

/*
findTopicid(1, function(idary){
	console.log(idary[0][0] + " " +idary[0][1]);
	getKinkyu(idary[0][1],function(res){
		var path = "pso2.json";
		fs.writeFile(path, JSON.stringify(res, null, '  ') , function (err) {
			console.log(err);
		});
	})
});*/

var job = new mycron({
  cronTime: '00 02 14 * * 3', //毎週水曜日14:02に実行
  onTick: function() {
    findTopicid(1, function(idary){
		console.log(idary[0][0] + " " +idary[0][1]);
		getKinkyu(idary[0][1],function(res){
			var path = "pso2.json";
			fs.writeFile(path, JSON.stringify(res, null, '  ') , function (err) {
				console.log(err);
			});
		});
	});
	console.log("i'm working!");
  },
  start: true //newした後即時実行するかどうか
  //timeZone: 'Japan/Tokyo'
});
job.start();

/*
getdata = {
	7月14日（木）:[ ["緊急", "7:00", "顕現せし星滅の災厄"], ["緊急", "13:00","「世界を堕とす輪廻の徒花」"] ],
	7月15日（金）:[ ["緊急", "7:00", "顕現せし星滅の災厄"], ["緊急", "13:00","「世界を堕とす輪廻の徒花」"] ],
	7月16日（土）:[] //未定or予定緊急なし
}
*/
