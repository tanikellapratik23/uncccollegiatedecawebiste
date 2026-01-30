// Lightweight client-side auth and storage for demo purposes
(function(){
  // helpers
  function read(key){ try{ return JSON.parse(localStorage.getItem(key)||'null') }catch(e){return null} }
  function write(key,val){ try{ localStorage.setItem(key, JSON.stringify(val)) }catch(e){} }

  // users: [{name,email,password,joined}]
  function getUsers(){ return read('deca_users') || [] }
  function saveUsers(u){ write('deca_users', u) }
  function getPosts(){ return read('deca_posts') || [] }
  function savePosts(p){ write('deca_posts', p) }

  function signUp({name,email,password}){
    const users = getUsers();
    if(users.find(x=>x.email===email)) return false;
    const now = new Date().toISOString();
    users.push({name, email, password, joined: now});
    saveUsers(users);
    // set session
    localStorage.setItem('deca_current', JSON.stringify({email,name}));
    return true;
  }

  function login(email,password){
    // admin shortcut
    if(isAdmin(email,password)){
      // mark admin session
      sessionStorage.setItem('admin_auth','ok');
      localStorage.setItem('deca_current', JSON.stringify({email,name:'Admin'}));
      return true;
    }
    const users = getUsers();
    const u = users.find(x=>x.email===email && x.password===password);
    if(!u) return false;
    localStorage.setItem('deca_current', JSON.stringify({email:u.email,name:u.name}));
    return true;
  }

  function logout(){ localStorage.removeItem('deca_current') }
  function getCurrentUser(){ try{ return JSON.parse(localStorage.getItem('deca_current')||'null') }catch(e){return null} }

  function isAdmin(email,password){ return email=== 'ptanike1@charlotte.edu' && password === 'DqAmcCB4/DqAmcCB4/' }

  function savePost(post){ const posts = getPosts(); posts.push(post); savePosts(posts) }

  // admin helpers
  function deleteUser(email){ let u = getUsers().filter(x=>x.email!==email); saveUsers(u); // also remove posts by that user
    let p = getPosts().filter(x=>x.authorEmail!==email); savePosts(p);
  }
  function deletePost(id){ let p = getPosts().filter(x=>x.id!==id); savePosts(p) }

  // expose
  window.getUsers = getUsers;
  window.saveUsers = saveUsers;
  window.getPosts = getPosts;
  window.savePost = savePost;
  window.savePosts = savePosts;
  window.signUp = signUp;
  window.login = login;
  window.logout = logout;
  window.getCurrentUser = getCurrentUser;
  window.isAdmin = isAdmin;
  window.deleteUser = deleteUser;
  window.deletePost = deletePost;
})();
