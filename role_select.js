function role_select_load(){
    loggedin2(firebase);
    getUserName(db,'/user_name/'+String(Year));
    let targets = document.getElementsByClassName("role");
    for(let i = 0; i < targets.length; i++){
        targets[i].addEventListener("click", async () => {
            db.collection('todays_role').doc(getTodayTimestamp().toString()).set({
                [selfID]: targets[i].getAttribute('id')
            },{merge:true}).then(function() {
                console.log('writing myname success!');
            }).then(function(){
                window.location.href = "./index.html"
            }).catch(function(error) {
                console.error('Error writing document: ', error);
            });
        }, false);
    }
}
