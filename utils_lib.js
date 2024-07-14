// 改修で作成したコードはここから

async function showRole(databaseObj) {
  let todaysRole = await getTodaysRole(databaseObj);
  let p_rolelist = '';
  let fg_rolelist = '';
  let guest_rolelist = '';
  let absentees = [];

  for(let i = 0; i < Object.keys(todaysRole).length; i++){
    if(todaysRole[Object.keys(todaysRole)[i]] == 'Presenter'){
      p_rolelist += Object.keys(todaysRole)[i] + '<br>';
    }else if(todaysRole[Object.keys(todaysRole)[i]] == 'Facilitator'){
      fg_rolelist += Object.keys(todaysRole)[i] + '<br>';
    }else if(todaysRole[Object.keys(todaysRole)[i]] == 'Guest'){
      guest_rolelist += Object.keys(todaysRole)[i] + '<br>';
    }else{
      absentees.push(Object.keys(todaysRole)[i])
    }
  }
  
  document.getElementById('p_list').innerHTML = p_rolelist;
  document.getElementById('fg_list').innerHTML = fg_rolelist;
  document.getElementById('g_list').innerHTML = guest_rolelist;
  $('#absent_selectbox').val(absentees).trigger("change"); 
}


async function getTodaysRole(databaseObj) {
  var docPath = "todays_role/" + getTodayTimestamp().toString() + "/";
  var data = await getDataFromDB(databaseObj, docPath);
  return data;
}

async function createCandidate(databaseObj) {
  let todaysRole = await getTodaysRole(databaseObj);
  let p_candidatelist = '<option></option>';
  let fg_candidatelist = '<option></option>';
  for(let i = 0; i < Object.keys(todaysRole).length; i++){
    if(todaysRole[Object.keys(todaysRole)[i]] == 'Presenter' && Object.keys(todaysRole)[i] != selfID){
      p_candidatelist += '<option>' + Object.keys(todaysRole)[i] + '</option>';
    }else if(todaysRole[Object.keys(todaysRole)[i]] == 'Facilitator' && Object.keys(todaysRole)[i] != selfID){
      fg_candidatelist += '<option>' + Object.keys(todaysRole)[i] + '</option>';
    }
  }
  for(let i = 1; i <= p_num; i++){
    document.getElementById('p' + i.toString()).innerHTML = p_candidatelist;
  }
  for(let i = 1; i <= p_num; i++){
    document.getElementById('fg' + i.toString()).innerHTML = fg_candidatelist;
  }

  document.getElementById('login_completed').disabled = true;
}

// ここまで

async function showParticipant(databaseObj) {
  var todaysPerticipants = await getTodaysParticipants(databaseObj);
  //console.log("test",todaysPerticipants);
  var date = new Date();
  var nowTimestamp = date.getTime();
  var message1;
  var status = "";
  for (key in todaysPerticipants) {
    var elapsedTime = (nowTimestamp - todaysPerticipants[key]) / 1000;
    //console.log('経過時間:',elapsedTime);
    if (elapsedTime < 20) {
      message1 = "<font color='blue'>ただ今</font> オンライン";
    } else if (20 <= elapsedTime && elapsedTime < 60) {
      message1 =
        "<font color='red'>" +
        parseInt(elapsedTime).toString() +
        "秒</font> 前オンライン";
    } else if (60 <= elapsedTime && elapsedTime < 60 * 60) {
      message1 =
        "<font color='red'>" +
        parseInt(elapsedTime / 60).toString() +
        "分</font> 前オンライン";
    } else if (60 * 60 <= elapsedTime && elapsedTime < 60 * 60 * 24) {
      message1 =
        "<font color='red'>" +
        parseInt(elapsedTime / 60 / 60).toString() +
        "時間</font> 前オンライン";
    }
    if (key != "undefined") {
      status += key + " さんは " + message1 + "<br>";
    }
  }
  var innerHTML = "こんにちは " + selfID + " さん<br><br>" + status;

  document.getElementById("greeting").innerHTML = innerHTML;
}

function getTodayTimestamp() {
  var date = new Date();
  var today =
    date.getTime() -
    date.getMilliseconds() -
    date.getSeconds() * 1000 -
    date.getMinutes() * 1000 * 60 -
    date.getHours() * 1000 * 60 * 60;
  //console.log(today);
  return today;
}

function dayToTimestamp(formattedDayTime) {
  return Date.parse(formattedDayTime);
}

async function overWriteDataToDB(databaseObj, docPath, newData) {
  // 注意:この関数を使うと、該当doc内の内容は「書き換えられる(上書きされる)」ので、不用意に使わないでください
  databaseObj
    .doc(docPath)
    .update(
      newData // ←ここは上書きする動作のコード
    )
    .then(function() {
      console.log("Document written with ID: ");
    })
    .catch(function(error) {
      console.error("Error adding document: ", error);
    });
}

async function addDataToDB(databaseObj, docPath, newData) {
  // util function to add data to database
  databaseObj
    .doc(docPath)
    .set(newData, { merge: true })
    .then(function() {
      //console.log("Document written with ID: ", selfID, "\n", newData);
    })
    .catch(function(error) {
      console.error("Error adding document: ", error);
    });
}

// document.getElementById("text-button_add_vote").onclick = async() => {addVoteData(fakeData);};
/*
var fakeData = {
    votersID:"Seki",
    votedID:"Zhang",
    voteRank:3,
}
*/
async function addVoteData(voteData) {
  try {
    //document.getElementById("add_vote").innerHTML = "send";
    // Add a new document with a generated id.
    let todayTimestamp = getTodayTimestamp();
    let timestamp = new Date().getTime();
    let jstTime = new Date().toString();
    console.log(timestamp);
    /*
    let newData = {
        [timestamp]:{
          //voters_id:voteData.votersId,
          voters_id:selfID,
          voted_id:voteData.votedId,
          vote_rank:voteData.voteRank,
          timestamp:timestamp,
          jst_time:jstTime,
        }
    };
    */
    let newData = {
      [selfID]: {
        [voteData.votedId]: {
          vote_rank: voteData.voteRank,
          role: voteData.role,
          updated_at: timestamp,
          updated_at_jst_time: jstTime
        }
      }
    };
    await addDataToDB(db, "vote_data/" + [todayTimestamp] + "/", newData);
    console.log("update succeed");
  } catch (error) {
    // The document probably doesn't exist.
    console.error("Error updating document: ", error);
  }
}

function updateStatus(databaseObj, dateTimestamp) {
  var docPath = "todays_participant/" + dateTimestamp.toString() + "/";
  let nowTimestamp = new Date().getTime();
  var newData = { [selfID]: nowTimestamp }; // ここのセルフIDはブラウザ内部のID管理で取得する、グローバル変数を参照 関数定義の上の二行目
  addDataToDB(databaseObj, docPath, newData);
}

async function getDataFromDB(databaseObj, docPath) {
  var docRef = databaseObj.doc(docPath);
  var tmp = await docRef
    .get()
    .then(function(doc) {
      if (doc.exists) {
        var docData = doc.data();
        // console.log("Document data:", docData);
        return doc.data();
      } else {
        console.log("No such document!");
        return "";
      }
    })
    .catch(function(error) {
      console.log("Error getting document:", error);
      return "";
    });
  return tmp;
}

async function getVoteData(databaseObj, timestamp) {
  var data = await getDataFromDB(
    databaseObj,
    "vote_data/" + timestamp.toString()
  );
  return data;
}

async function getTodaysParticipants(databaseObj) {
  var docPath = "todays_participant/" + getTodayTimestamp().toString() + "/";
  var data = await getDataFromDB(databaseObj, docPath);
  return data;
}

function updatePresentationDuration(
  databaseObj,
  dateTimestamp,
  presenterID,
  duration
) {
  var docPath = "presentation_duration/" + dateTimestamp.toString() + "/";
  var newData = {
    [presenterID]: {
      duration: duration
    }
  };
  addDataToDB(databaseObj, docPath, newData);
}

//var fakePairData = {pair1:{P:"Zhang", FG:"Seki"}, pair2:{P:"Koyama", FG:"Mochida"}, pair3:{P:"Yao", FG:"Kase"}};
function addPairData(pairData) {
  try {
    //document.getElementById("add_vote").innerHTML = "send";
    // Add a new document with a generated id.
    let todayTimestamp = getTodayTimestamp();
    let timestamp = new Date().getTime();
    console.log(timestamp);
    var newData = pairData;
    newData["updated_at"] = timestamp;

    addDataToDB(db, "pair_data/" + [todayTimestamp] + "/", newData);
    console.log("update succeed");
  } catch (error) {
    // The document probably doesn't exist.
    console.error("Error updating document: ", error);
  }
}

function loggedin(firebaseObj) {
  console.log("logged in function!");
  var loggedinuser = firebaseObj.auth().currentUser;
  var userEmail = loggedinuser.mail;
  console.log(userEmail);
  if (loggedinuser) {
    // User is signed in.
    console.log("logged in!");
    console.log(loggedinuser);
    //window.location.href = "./vote.html";
  } else {
    // No user is signed in.
    console.log("not logged in!");
    console.log(loggedinuser);
    //window.location.href = "./index.html";
  }
}

function loggedin2(firebaseObj) {
  firebaseObj.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      login_user_email = user.email;
      console.log("logged in as", user.email);
    } else {
      // No user is signed in.
      console.log("not logged in");
      window.location.href = "./login.html";
    }
  });
}

// ログインしたユーザの名前をデータベースより取得, selfIDに名前をセット
// 張くんのコードを引用しました。
function getUserName(databaseObj, docPath) {
  var docPath = docPath;
  var docRef = databaseObj.doc(docPath);

  docRef
    .get()
    .then(function(doc) {
      if (doc.exists) {
        var docData = doc.data();
        selfID = docData[login_user_email];
        document.getElementById('myname').innerHTML = selfID;
        console.log("Login user's name (selfID):", selfID);
      } else {
        console.log("No such email!");
        return "";
      }
    })
    .catch(function(error) {
      console.log("Error getting document:", error);
      return "";
    });
}


// 欠席者の追加
async function changeAbsentee(event, databaseObj){
  console.log("changeAbsentee")
  let selectedName = event.params.data.id;
  let todaysRole = await getTodaysRole(databaseObj);

  // ログインしている人は他の役職を持っているので欠席者扱いにしない。
  if(Object.keys(todaysRole).includes(selectedName) && todaysRole[selectedName] != "Absent"){
    let selectedNameArray = $('#absent_selectbox').val();
    // ログインしている人なので、選択されている名前から今選択された名前を削除する
    selectedNameArray.splice(selectedNameArray.indexOf(selectedName))
    // 選択されているものを更新する
    $('#absent_selectbox').val(selectedNameArray).trigger('change');
  }else if(!(Object.keys(todaysRole).includes(selectedName))){
    // 欠席者として追加
    db.collection('todays_role').doc(getTodayTimestamp().toString()).set({
      [selectedName]: "Absent"
    },{merge:true})
  }
}

// 欠席者の削除
async function deleteAbsentee(event, databaseObj){
  let selectedName = event.params.data.id;
  let todaysRole = await getTodaysRole(databaseObj);
  // firebaseからabsentの記録を消す。
  if(Object.keys(todaysRole).includes(selectedName) && todaysRole[selectedName] == "Absent"){
    db.collection("todays_role").doc(getTodayTimestamp().toString()).update({
      [selectedName]: firebase.firestore.FieldValue.delete()
    });
  }
}

function initAbsent(databaseObj){
  // Select2の初期化
  $(document).ready(function() {
    $('#absent_selectbox').select2();
  });
  // 初期設定
  $('#absent_selectbox').select2({
    multiple: true, // 複数選択可能
    allowClear: true, // 削除ボタンの追加
  });

  // 選択できるリストの作成
  Object.keys(name_list).forEach(name =>{
    // 除外リストに含まれていないなら選択肢に追加
    if(!(excluded_name.includes(name))){
      // 名前の登録時に大文字から始まる名前でないとうまく動作しない場合があります。
      const option_name = new Option(name_list[name][0], name_list[name][1]);
      $('#absent_selectbox').append(option_name);
    }   
  })
  // 欠席者の削除と追加の関数の設定
  $('#absent_selectbox').on('select2:select',function(event){
    return changeAbsentee(event, databaseObj)
  });
  $('#absent_selectbox').on('select2:unselect',function(event){
    deleteAbsentee(event, databaseObj)
  });
}