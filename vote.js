//投票画面のjsファイル
/*-------------------------------*/
let Year = 2024;

//このリストは予測候補と入力時の名前のエラーチェックと再投票防止に使います。
//毎年更新をお願いします。
var name_list = {
  'Ghita':['Ghita','Ghita','ghita','ギータ','ぎーた'],
  'Matsubara':['松原','Matsubara','matsubara','マツバラ','まつばら'],
  'Natori':['名執','Natori','natori','ナトリ','なとり'],
  'Hashiyama':['橋山','Hashiyama','hashiyama','ハシヤマ','はしやま'],
  'Deguchi':['出口','Deguchi','deguchi','デグチ','でぐち'],
  'Higashikawa':['東川','Higashikawa','higashikawa','ヒガシカワ','ひがしかわ'],
  'Shiraishi':['白石','Shiraishi','shiraishi','シライシ','しらいし'],
  'Ohara':['小原','Ohara','ohara','オハラ','おはら'],
  'Niitsuma':['新妻','Niitsuma','niitsuma','ニイツマ','にいつま'],
  'Hosokawa':['細川','Hosokawa','hosokawa','ホソカワ','ほそかわ'],
  'Yanagiya':['柳谷','Yanagiya','yanagiya','ヤナギヤ','やなぎや'],
  'Takeda':['武田','Takeda','takeda','タケダ','たけだ'],
  'Nakata':['中田','Nakata','nakata','ナカタ','なかた'],
  'Yang':['杨','Yang','yang','ヤン','やん'],
  'Kanno':['菅野','Kanno','kanno','カンノ','かんの'],
  'Tanaka':['田中','Tanaka','tanaka','タナカ','たなか'],
  'Endo':['遠藤','Endo','endo','エンドウ','えんどう'],
  'Saito':['斉藤','Saito','saito','サイトウ','さいとう'],
};

//欠席者と参加者から自動で「全員がログイン完了」を発火させるのでname_listに存在して全体ゼミには基本的に参加しない人を追加します。
//name_listのkeyの部分を書いてください。
//毎年更新をお願いします。
var excluded_name = ["Ghita", "Matsubara", "Hashiyama", "Shiraishi"]

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
      // document.getElementById(item).disabled = false;
      document.getElementById(item).disabled = false;
      document.getElementById(item).style.borderColor = "#000000";
      // for(let i = 1; i <= 7; i++){
      //   document.getElementById('p' + i.toString()).disabled = false;
      //   document.getElementById('fg' + i.toString()).disabled = false;
      // }
    }
  }
  // else {
  //   // チェックが入っていなかったら無効化
  //   for (let item of textid_list) {
  //     document.getElementById(item).disabled = true;
  //   }
  // }

  // P / FG いずれのチェックもついている状態で送信ボタンを活性化させる
  let ischecked_all_list = check_p_list
  .map(id => document.getElementById(id).checked)
  .concat(check_fg_list.map(id => document.getElementById(id).checked));
  if( ischecked_all_list.every(value => value == true) ) {
    document.getElementById("submit_vote").disabled = false;
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
// text_p_list.push("submit_vote");

var check_fg_list = [
  "check_fg1",
  "check_fg2",
  "check_fg3",
];
var text_fg_list = [];
for(var i=0; i<fg_num; i++) {
  text_fg_list[i] = "fg"+String(i+1);
}
// text_p_list.push("submit_vote");


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
  var p_form_value = new Array(p_num);
  var fg_form_value = new Array(fg_num);
  
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
  
  
  //再投票を禁止する（既にfirebaseに自分が投票したデータが有る場合は送信できなくする） 
  //ここで投票済みの人物のリストを作り、下のif文内のvoters_list.indexOf(selfID)<0で投票済みかをチェックする
  voters_list = [];
  await checkRevote();

  // 参加者の役割を見て、すべての候補に投票できているかどうか確認する
  // まずは、各役割にどの参加者が割り振られているかを表す表をつくる
  let todaysRole = await getTodaysRole(db);
  let p_list = [];
  let fg_list = [];
  // 注: todaysRoleのNULLチェックは省略する。
  for(let i = 0; i < Object.keys(todaysRole).length; i++){
    if(todaysRole[Object.keys(todaysRole)[i]] == 'Presenter'){
      p_list.push(Object.keys(todaysRole)[i]);
    }else if(todaysRole[Object.keys(todaysRole)[i]] == 'Facilitator'){
      fg_list.push(Object.keys(todaysRole)[i]);
    }
  }
  
  // さっきの表を投票者候補として使うには、自分を候補から消す必要がある
  p_list = p_list.filter(x => x != selfID)
  fg_list = fg_list.filter(x => x != selfID)

  // 次に、各役割の投票候補すべてに、その役割の候補として投票できているか確認する
  // 注: 各役割で全員不足なく投票できているからといって、投票が正しいとは限らない。1位を空欄にして投票されてる可能性もある。
  let p_fg_exact_flag = true;
  let p_not_voted = p_list.filter(
    function(x) {
      return p_form_value.indexOf(x) == -1
    }
  )
  if (p_not_voted.length > 0) p_fg_exact_flag = false;
  console.log(p_not_voted);
  let fg_not_voted = fg_list.filter(
    function(x) {
      return fg_form_value.indexOf(x) == -1
    }
  )
  if (fg_not_voted.length > 0) p_fg_exact_flag = false;
  console.log(fg_not_voted);

  // 当日参加者以外への投票がされているか確認する。
  let voted_for_absentee_flag = true; // trueだと大丈夫という意味
  let p_over_voted = p_form_value.filter(
    function(x) {
      return p_list.indexOf(x) == -1 && x != ""
    }
  )
  if (p_over_voted.length > 0) voted_for_absentee_flag = false;
  console.log(p_over_voted);
  let fg_over_voted = fg_form_value.filter(
    function(x) {
      return fg_list.indexOf(x) == -1 && x != ""
    }
  )
  if (fg_over_voted.length > 0) voted_for_absentee_flag = false;
  console.log(fg_over_voted);

  // 投票人数チェック(旧: 間違った名前が入力されているかのチェック)
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

  let p_num_check = false;
  if (count_p_num == p_list.length) p_num_check = true;
  let fg_num_check = false;
  if (count_fg_num == fg_list.length) fg_num_check = true;

  // 1位を抜かして2位を投票してるてきなのをチェック
  let skip_flag = true; // スキップしてなければtrue
  for(let i=0; i<p_num-1; i++) {
    if (p_form_value[i] == "" && p_form_value[i+1] != "") {
      skip_flag = false;
      break;
    }
  }
  for(let i=0; i<fg_num-1; i++) {
    if (fg_form_value[i] == "" && fg_form_value[i+1] != "") {
      skip_flag = false;
      break;
    }
  }
  
  if(p_form_value.indexOf(selfID) < 0 && fg_form_value.indexOf(selfID) < 0) {
    if (multipleCheck <= 0 && p_num_check && fg_num_check && count_p_num != 0 && count_fg_num != 0
        && p_fg_exact_flag && voted_for_absentee_flag && skip_flag) {
      if (voters_list.indexOf(selfID) < 0){
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
        checks[0].innerHTML = "再投票している可能性があります。<BR>投票し直したい場合は、システム管理者に連絡してください。";
        //alert('自分の名前や間違った名前、同じ名前を複数個入力している可能性があります。');
      }
    }else{
      const checks = document.getElementsByClassName('check');
      checks[0].innerHTML = "投票先を間違えている可能性があります。投票候補を見て、すべての候補に正しく投票してください。";
      //alert('自分の名前や間違った名前、同じ名前を複数個入力している可能性があります。');
    }
  }else{
    const checks = document.getElementsByClassName('check');
    checks[0].innerHTML = "自分の名前を投票している可能性があります。自分は投票候補から除いてください。";
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
// setInterval(function(){return showParticipant(db)}, 6*1000);
setInterval(function(){return showRole(db)}, 6*1000);

// 10秒ごとに自分の最終ログイン状態をアップデート
setInterval(function(){return updateStatus(db, getTodayTimestamp())}, 10*1000);

// 30秒ごとにログイン状態をチェックして、ログインしていなかったらログインを強制する
setInterval(function(){return loggedin2(firebase)}, 30*1000);

function PageLoad(){
  console.log("page loaded");
  loggedin2(firebase);
  let flag = 0;
  let getlen = new Promise((resolve, reject) => {
    db.collection('todays_role').doc(getTodayTimestamp().toString()).get().then(function(doc) {
      if (doc.data() != undefined) {
        for(let i = 0; i < Object.keys(doc.data()).length; i++){
          // DBに存在するかとその役割が欠席者でないことを調べる。
          if(Object.keys(doc.data())[i] == selfID && doc.data()[selfID] != "Absent"){
            flag = 1;
          }
        }  
      }
    }).then(() => {
      if(flag == 0){
        window.location.href = './role_select.html';
      }
    })
    resolve();
  });
  // showshowParticipant(db);
  
  // 欠席者の初期化、表示を行う
  initAbsent(db)
  
  // 役割を表示する
  showRole(db);

  // 全員がログインできたらボタンを押し、firebaseに情報を送る
  let login_completed_button = document.getElementById('login_completed');
  login_completed_button.addEventListener('click', function() {
    db.collection('login_completed').doc(getTodayTimestamp().toString()).set({
      completed: 'OK'
    });
    
  }, false);

  // firebaseを監視し、欠席者を除いて全員がログインしたら自動的に「全員がログイン完了」を発火させる
  db.collection('todays_role').doc(getTodayTimestamp().toString()).onSnapshot((doc) => {
    // ドキュメントの存在に対するガード。全員がログインしていなくてもここで抜ける
    if (!doc.exists) {
      return;
    }
    // ログインした人、欠席者扱いの人を取得する
    let todaysRole = doc.data()
    let setTodaysRole = new Set(Object.keys(todaysRole))
      // 欠席者を含むログインした人と全体ゼミに基本参加する人が一致するかを調べるためにの集合で比較する
    let baseParticipant = new Set(Object.keys(name_list));
    excluded_name.forEach((name)=>{
      baseParticipant.delete(name);
    })
    
    // 全体ゼミに基本参加する人 < 役割のある人(参加者+欠席者)に部分集合であるかを調べる
    if(baseParticipant.isSubsetOf(setTodaysRole)){
      // 自動で"login_completed"のステータスをOKにする
      db.collection('login_completed').doc(getTodayTimestamp().toString()).set({
        completed: 'OK'
      });
      document.getElementById('absent_selectbox').disabled = true;
    }
  })
  
  // firebaseを監視し、全員がログインできたことを感知したら、チェックボックスを押せるようにし、フルダウンメニューの候補を作成する
  db.collection('login_completed').doc(getTodayTimestamp().toString()).onSnapshot((doc) => {
    if(doc.exists){
      for(let i = 1; i <= 5; i++){
        document.getElementById('check_p' + i.toString()).disabled = false;
      }
      for(let i = 1; i <= 3; i++){
        document.getElementById('check_fg' + i.toString()).disabled = false;
      }
      createCandidate(db);
    }       
  });
}
