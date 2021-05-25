//投票画面のjsファイル
/*-------------------------------*/
let Year = 2021;

//このリストは予測候補と入力時の名前のエラーチェックと再投票防止に使います。
//毎年更新をお願いします。
var name_list = {
  'Ghita':['Ghita','Ghita','ghita','ギータ','ぎーた'],
  'Matsubara':['松原','Matsubara','matsubara','マツバラ','まつばら'],
  'Ogino':['荻野','Ogino','ogino','オギノ','おぎの'],
  'Ikeda':['池田','Ikeda','ikeda','イケダ','いけだ'],
  'Maemoto':['前本','Maemoto','maemoto','マエモト','まえもと'],
  'Sakamoto':['坂元','Sakamoto','sakamoto','サカモト','さかもと'],
  'Ni':['倪','Ni','ni','ニー','にー'],
  'Gotou':['後藤','Gotou','gotou','ゴトウ','ごとう'],
  'Kobayashi':['小林','Kobayashi','kobayashi','コバヤシ','こばやし'],
  'Ueda':['植田','Ueda','ueda','ウエダ','うえだ'],
  'Ogawa':['小川','Ogawa','ogawa','オガワ','おがわ'],
  'Sasakawa':['笹川','Sasakawa','sasakawa','ササカワ','ささかわ'],
  'Tsutsumi':['堤','Tsutsumi','tsutsumi','ツツミ','つつみ'],
  'Hayashi':['林','Hayashi','hayashi','ハヤシ','はやし']
};

//PとFGの人数(ここを変更すると入力フォームの数が変わります)
//指定した数だけフォームに入力できる & firebaseにデータが送信される、ようにしたいな。
var p_num = 7;
var fg_num = 7;
/*-------------------------------*/




//各入力フォームの名前が正しいかの確認用のフラグ
var p_flag = [];
for(var i=0; i<p_num; i++) {
  p_flag[i] = 0;
}
var fg_flag = [];
for(var i=0; i<fg_num; i++) {
  fg_flag[i] = 0;
}

//入力フォーム内にここに書かれていない文字列が入ると赤色に変化する
var list = [];
Object.keys(name_list).forEach(function(key) {
  this[key].forEach(function(val) {
    list.push(val);
  });
}, name_list);

var name_list_forMap = [];
Object.keys(name_list).forEach(function(key) {
  var names = [];
  this[key].forEach(function(val) {
    names.push(val);
  });
  name_list_forMap.push([key, names]);
}, name_list);

const dictMap2 = new Map();
name_list_forMap.forEach(row => {
  row[1].forEach(name => dictMap2.set(name, row[0]))
});

//firebase内の投票データからその日投票済みの人の名前を取得して格納するリスト。再投票を禁止するために使用。
var voters_list = [];

//selfID:投票者のID。ログイン時にデータベース(user_name/<year>)より取得して割り当てられる。
//const db = firebase.firestore();
var login_user_email = "";
getUserName(db,'/user_name/'+String(Year));
var selfID = "";


// 入力フォーム内に入力された名前を確認、listに登録されたもの以外が入ると赤色に変化する。
function submit(thisId){
  var value = document.getElementById(thisId).value;
  
  var p_ids = []
  for(var i=0; i<p_num; i++) {
    p_ids[i] = "p"+String(i+1);
  }
  var fg_ids = []
  for(var i=0; i<fg_num; i++) {
    fg_ids[i] = "fg"+String(i+1);
  }
  
  if(list.indexOf(value) >= 0){
    document.getElementById(thisId).style.backgroundColor = "#FFFFFF";
    
    for(var i=0; i<p_num; i++) {
      if(thisId == p_ids[i]) {
        p_flag[i] = 1;
      }
    }
    
    for(var i=0; i<fg_num; i++) {
      if(thisId == fg_ids[i]) {
        fg_flag[i] = 1;
      }
    }
    
    return true;
    
  }else{
    document.getElementById(thisId).style.backgroundColor = "mistyrose";
    
    for(var i=0; i<p_num; i++) {
      if(thisId == p_ids[i]) {
        p_flag[i] = 0;
      }
    }
    
    for(var i=0; i<fg_num; i++) {
      if(thisId == fg_ids[i]) {
        fg_flag[i] = 0;
      }
    }
    
    return false;
  }
}


function connecttext(textid_list,  checkboxid_list ) {  
  var ischecked_list = checkboxid_list.map(id => document.getElementById(id).checked);
  if( ischecked_list.every(value => value == true) ) {
    // チェックが入っていたら有効化
    for (let item of textid_list) {
      document.getElementById(item).disabled = false;
      document.getElementById(item).style.borderColor = "#000000";
    }
  }
  else {
    // チェックが入っていなかったら無効化
    for (let item of textid_list) {
      document.getElementById(item).disabled = true;
    }
  }
}

var check_p_list = [
  "check_p1",
  "check_p2",
  "check_p3",
  "check_p4",
  "check_p5",
];
var text_p_list = [];
for(var i=0; i<p_num; i++) {
  text_p_list[i] = "p"+String(i+1);
}
text_p_list.push("submit_vote");

var check_fg_list = [
  "check_fg1",
  "check_fg2",
  "check_fg3",
];
var text_fg_list = [];
for(var i=0; i<fg_num; i++) {
  text_fg_list[i] = "fg"+String(i+1);
}
text_p_list.push("submit_vote");


// 投票ボタンを押した時の処理
async function btn_send(){  
  
  /* firebaseにデータを送信 */
  //テキストボックスのidをまとめた配列。検索しやすくするために用意した。
  var p_form = [];
  for(var i=0; i<p_num; i++) {
    p_form[i] = "p"+String(i+1);
  }
  var fg_form = [];
  for(var i=0; i<fg_num; i++) {
    fg_form[i] = "fg"+String(i+1);
  }

  //各テキストボックスの値を記録するための配列。
  var p_form_value = new Array(5);
  var fg_form_value = new Array(5);
  
  //PとFGの数だけテキストボックスの値を取得
  for(let i=0; i<p_num; i++){
    p_form_value[i] = document.getElementById(p_form[i]).value;
  }
  for(let i=0; i<fg_num; i++){
    fg_form_value[i] = document.getElementById(fg_form[i]).value;
  }
    
  // 自分の名前が入力されている xor 複数同じ名前が含まれている xor 間違った名前が入力されていると投票できなくなる。
  
  // 複数同じ名前が含まれているかのチェック
  var p_fg_form_value = p_form_value.concat(fg_form_value);
  var multipleCheck = p_fg_form_value.filter(
  function (x, i, self) {
    return self.indexOf(x) === i && i !== self.lastIndexOf(x);
  });
  
  // 間違った名前が入力されているかのチェック
  var count_p_num = 0;
  for(let i = 0; i < p_num; i++){
    if(p_form_value[i] != "") {
      count_p_num += 1;
    }
  }
  var count_fg_num = 0;
  for(let i = 0; i < fg_num; i++){
    if(fg_form_value[i] != "") {
      count_fg_num += 1;
    }
  }
  
  var p_num_check = false;
  var p_flag_sum = 0;
  p_flag.forEach(function(value) {
    p_flag_sum += value;
  })
  if(p_flag_sum == count_p_num) {
    p_num_check = true;
  }

  var fg_num_check = false;
  var fg_flag_sum = 0;
  fg_flag.forEach(function(value) {
    fg_flag_sum += value;
  })
  if(fg_flag_sum == count_fg_num) {
    fg_num_check = true;
  }
  
  //再投票を禁止する（既にfirebaseに自分が投票したデータが有る場合は送信できなくする） 
  //ここで投票済みの人物のリストを作り、下のif文内のvoters_list.indexOf(selfID)<0で投票済みかをチェックする
  voters_list = [];
  await checkRevote();
  
  if(p_form_value.indexOf(selfID) < 0 && fg_form_value.indexOf(selfID) < 0 && 
     multipleCheck <= 0 && p_num_check && fg_num_check && count_p_num != 0 && 
     count_fg_num != 0 && voters_list.indexOf(selfID) < 0){
    //各フォームのデータを成形してfirebaseに送信
    for(let i = 0; i < p_num; i++){
      if(p_form_value[i] != "") {
        var p_voteData = {
          votersId: dictMap2.get(selfID),
          votedId: dictMap2.get(p_form_value[i]),
          voteRank: i+1,
          role: "Presentor",
        };
        await addVoteData(p_voteData);
      }
    }
    for(let i = 0; i < fg_num; i++){
      if(fg_form_value[i] != ""){
        var fg_voteData = {
          votersId: dictMap2.get(selfID),
          votedId: dictMap2.get(fg_form_value[i]),
          voteRank: i+1,
          role: "Facilitator",
        };
        await addVoteData(fg_voteData);
      }
    }

    //投票結果画面へ遷移
    var move = function(){
      window.location.href = "result.html"
    } 
    setTimeout(move, 1200);
  }else{
    const checks = document.getElementsByClassName('check');
    checks[0].innerHTML = "自分の名前や間違った名前、同じ名前を複数個入力している可能性があります。";
    //alert('自分の名前や間違った名前、同じ名前を複数個入力している可能性があります。');
  }
}

 
//dbからデータを取得してその日投票済みの人の一覧を作る。
//張くんのコードを引用しました。
async function checkRevote(){
  var voters = [];
  
  let todayTimestamp = getTodayTimestamp();
  var docRef = db.doc('vote_data/' + [todayTimestamp] + '/');
  await docRef
    .get()
    .then(function(doc) {
      if (doc.exists) {
        var docData = doc.data();
        for (let votersId in docData) {
          voters.push(votersId);
        };
        voters_list = voters;
      };
  });
};


async function predict(thisInput,thisUl){  
  const input = document.getElementById(thisInput);
  const ul = document.getElementById(thisUl);
  const dictMap = new Map(name_list_forMap);
  
  dictMap.forEach((v, key) => {
    
    const li = document.createElement("li");
    li.innerHTML = key;
    li.style.display = "none";
    
    // 候補部分をクリックした時
    li.onclick = () => {
      // 1回目の処理
      input.value = li.innerHTML;
      submit(thisInput);
      for (let i = 0; i < ul.children.length; ++i) {
        ul.children[i].style.display = "none";
      }
      
      // 2回目以降
      input.onblur = () => {
        window.setTimeout(
          (function(){
            for (let i = 0; i < ul.children.length; ++i) {
              ul.children[i].style.display = "none";
            }
          })
        ,200);
        window.setTimeout((function(){submit(thisInput)}),100);
      };
      
    };
    ul.appendChild(li);
  });
  
  // フォームに文字を入力した時
  input.onkeyup = () => {
    const str = input.value;
    let idx = 0;
    dictMap.forEach((arr, key) => {
      if (
        str !== ""
        && arr.reduce((acc, cur) => acc || cur.indexOf(str) === 0, false)
      ) {
        ul.children[idx].style.display = "block";
      } else {
        ul.children[idx].style.display = "none";
      }
      ++idx;
    });
    
    input.onblur = () => {
        window.setTimeout(
          ()=>{
            for (let i = 0; i < ul.children.length; ++i) {
              ul.children[i].style.display = "none";
            }
          }
        ,200);
        window.setTimeout(()=>{submit(thisInput)},100);
      };
    
  };
}


// 6秒ごとに自分の最終ログイン状態をアップデート
setInterval(function(){return showParticipant(db)}, 6*1000);

// 10秒ごとに自分の最終ログイン状態をアップデート
setInterval(function(){return updateStatus(db, getTodayTimestamp())}, 10*1000);

// 30秒ごとにログイン状態をチェックして、ログインしていなかったらログインを強制する
setInterval(function(){return loggedin2(firebase)}, 30*1000);

function PageLoad(){
  console.log("page loaded");
  loggedin2(firebase);
  showParticipant(db);
};
