const $ = id => document.getElementById(id);
const money = n => "$" + Number(n).toFixed(Number.isInteger(n) ? 0 : 2);

let state = JSON.parse(localStorage.getItem("scheduledData")) || {
  users: [
    {id:"u1", username:"admin", password:"admin123", role:"admin", name:"Marly Admin"},
    {id:"t1", username:"marly", password:"tutor123", role:"tutor", name:"Marly Al Houkayem", whatsapp:"96176174738", rate:15, locations:["Online","On Campus (Koura Campus)"], courses:["Physics 213","BIO201"]},
    {id:"s1", username:"student", password:"student123", role:"student", name:"Ahmad Khalil", phone:"+961 00 000 000", type:"individual"},
    {id:"g1", username:"group", password:"group123", role:"student", name:"Physics Group 1", phone:"+961 00 000 001", type:"group", members:["Student 1","Student 2"]}
  ],
  courses:["Physics 213","BIO201"],
  availability:[{tutorId:"t1", day:"Monday", start:"17:00", end:"21:00", location:"Online"}],
  bookings:[
    {id:"b1", studentId:"s1", tutorId:"t1", course:"Physics 213", date:"2026-06-28", start:"17:00", duration:2, format:"Individual", groupSize:1, sessionTypes:["Course & Formulas","Previous Exams"], location:"Online", status:"Upcoming", paymentMethod:"Whish", payments:[{name:"Ahmad Khalil", amount:30, paid:false}], notes:"", attachments:["Formula Sheet.pdf"]},
    {id:"b2", studentId:"g1", tutorId:"t1", course:"Physics 213", date:"2026-06-30", start:"18:00", duration:1, format:"Group", groupSize:2, sessionTypes:["Book Exercises"], location:"On Campus (Koura Campus)", status:"Upcoming", paymentMethod:"Cash", payments:[{name:"Student 1", amount:15, paid:true},{name:"Student 2", amount:15, paid:false}], notes:"", attachments:["Chapter exercises.pdf"]}
  ],
  documents:[{ownerId:"s1", title:"Physics 213 Summary.pdf"},{ownerId:"g1", title:"Group Previous Exam.pdf"}]
};
let currentUser = null;

function save(){ localStorage.setItem("scheduledData", JSON.stringify(state)); }

setTimeout(()=>{ $("splash").classList.add("hidden"); $("app").classList.remove("hidden"); }, 1200);

function login(){
  const u = $("username").value.trim();
  const p = $("password").value.trim();
  const found = state.users.find(x=>x.username===u && x.password===p);
  if(!found) return alert("Wrong username or password.");
  currentUser = found;
  $("loginPage").classList.add("hidden");
  $("dashboard").classList.remove("hidden");
  $("roleLabel").textContent = `${found.name} • ${found.role.toUpperCase()}`;
  renderTabs();
}
function logout(){ currentUser=null; $("dashboard").classList.add("hidden"); $("loginPage").classList.remove("hidden"); }

function renderTabs(){
  let tabs = [];
  if(currentUser.role==="admin") tabs = ["Overview","Tutors","Students","Courses","All Bookings","Documents"];
  if(currentUser.role==="tutor") tabs = ["Today","Availability","Financial","Documents","Profile"];
  if(currentUser.role==="student") tabs = ["Book","My Sessions","Payments","Documents","Profile"];
  $("tabs").innerHTML = tabs.map((t,i)=>`<button class="${i===0?'active':''}" onclick="openTab('${t}', this)">${t}</button>`).join("");
  openTab(tabs[0], $("tabs").querySelector("button"));
}
function openTab(tab, btn){
  document.querySelectorAll(".tabs button").forEach(b=>b.classList.remove("active"));
  if(btn) btn.classList.add("active");
  if(tab==="Overview") return adminOverview();
  if(tab==="Tutors") return adminTutors();
  if(tab==="Students") return adminStudents();
  if(tab==="Courses") return adminCourses();
  if(tab==="All Bookings") return allBookings(true);
  if(tab==="Documents") return documentsPage();
  if(tab==="Today") return tutorToday();
  if(tab==="Availability") return availabilityPage();
  if(tab==="Financial") return financialPage();
  if(tab==="Profile") return profilePage();
  if(tab==="Book") return bookingPage();
  if(tab==="My Sessions") return mySessions();
  if(tab==="Payments") return paymentsPage();
}

function tutorName(id){return state.users.find(u=>u.id===id)?.name || "-"}
function studentName(id){return state.users.find(u=>u.id===id)?.name || "-"}
function tutorObj(id){return state.users.find(u=>u.id===id)}
function totalBooking(b){return b.payments.reduce((s,p)=>s+p.amount,0)}
function statusBadge(paid){return `<span class="badge ${paid?'paid':'unpaid'}">${paid?'Paid':'Unpaid'}</span>`}

function adminOverview(){
  const total = state.bookings.reduce((s,b)=>s+totalBooking(b),0);
  const paid = state.bookings.flatMap(b=>b.payments).filter(p=>p.paid).reduce((s,p)=>s+p.amount,0);
  const unpaid = state.bookings.flatMap(b=>b.payments).filter(p=>!p.paid).reduce((s,p)=>s+p.amount,0);
  $("content").innerHTML = `<div class="grid">
    <div class="card"><h3>Total Bookings</h3><h1>${state.bookings.length}</h1></div>
    <div class="card"><h3>Total Revenue</h3><h1>${money(total)}</h1></div>
    <div class="card"><h3>Paid</h3><h1>${money(paid)}</h1></div>
    <div class="card"><h3>Unpaid</h3><h1>${money(unpaid)}</h1></div>
  </div><div class="card"><h2>Admin Control</h2><p class="muted">You can create tutors/students, assign courses, view all bookings and payments, and reset accounts.</p></div>`;
}

function adminTutors(){
  const tutors = state.users.filter(u=>u.role==="tutor");
  $("content").innerHTML = `<div class="card"><h2>Tutors</h2>
  <table class="table"><tr><th>Name</th><th>Rate</th><th>WhatsApp</th><th>Courses</th><th>Locations</th></tr>
  ${tutors.map(t=>`<tr><td>${t.name}</td><td>${money(t.rate)}/h/person</td><td>${t.whatsapp||"-"}</td><td>${(t.courses||[]).join(", ")}</td><td>${(t.locations||[]).join(", ")}</td></tr>`).join("")}</table>
  <hr><h3>Add Tutor</h3><div class="row">
  <input id="tn" placeholder="Full name"><input id="tu" placeholder="Username"><input id="tp" placeholder="Temporary password">
  <input id="tw" placeholder="WhatsApp e.g. 96176174738"><input id="tr" type="number" placeholder="Hourly rate"><input id="tl" placeholder="Locations, comma separated">
  </div><input id="tc" placeholder="Courses, comma separated e.g. Physics 213, BIO201">
  <button onclick="addTutor()">Add Tutor</button></div>`;
}
function addTutor(){
  state.users.push({id:"t"+Date.now(), role:"tutor", name:$("tn").value, username:$("tu").value, password:$("tp").value, whatsapp:$("tw").value, rate:Number($("tr").value||15), locations:$("tl").value.split(",").map(x=>x.trim()).filter(Boolean), courses:$("tc").value.split(",").map(x=>x.trim()).filter(Boolean)});
  save(); adminTutors();
}

function adminStudents(){
  const students = state.users.filter(u=>u.role==="student");
  $("content").innerHTML = `<div class="card"><h2>Students / Groups</h2>
  <table class="table"><tr><th>Name</th><th>Type</th><th>Phone</th><th>Members</th></tr>
  ${students.map(s=>`<tr><td>${s.name}</td><td>${s.type||"individual"}</td><td>${s.phone||"-"}</td><td>${(s.members||[]).join(", ")}</td></tr>`).join("")}</table>
  <hr><h3>Add Student or Group</h3><div class="row">
  <input id="sn" placeholder="Name"><input id="su" placeholder="Username"><input id="sp" placeholder="Password"><input id="sphone" placeholder="Phone">
  <select id="stype"><option>individual</option><option>group</option></select></div>
  <input id="smembers" placeholder="For group: members comma separated">
  <button onclick="addStudent()">Add Student/Group</button></div>`;
}
function addStudent(){
  state.users.push({id:"s"+Date.now(), role:"student", name:$("sn").value, username:$("su").value, password:$("sp").value, phone:$("sphone").value, type:$("stype").value, members:$("smembers").value.split(",").map(x=>x.trim()).filter(Boolean)});
  save(); adminStudents();
}

function adminCourses(){
  $("content").innerHTML = `<div class="card"><h2>Admin Course Management</h2><p class="muted">Only admin adds/assigns courses. Students search by course.</p>
  <table class="table"><tr><th>Tutor</th><th>Courses</th></tr>${state.users.filter(u=>u.role==="tutor").map(t=>`<tr><td>${t.name}</td><td>${(t.courses||[]).join(", ")}</td></tr>`).join("")}</table></div>`;
}

function bookingRows(bookings, editable=false){
  return `<table class="table"><tr><th>Date</th><th>Time</th><th>Course</th><th>Tutor</th><th>Student/Group</th><th>Duration</th><th>Total</th><th>Payment</th><th>Status</th></tr>
  ${bookings.map(b=>`<tr><td>${b.date}</td><td>${b.start}</td><td>${b.course}</td><td>${tutorName(b.tutorId)}</td><td>${studentName(b.studentId)}</td><td>${b.duration}h</td><td>${money(totalBooking(b))}</td><td>${b.paymentMethod}</td><td>${b.payments.map((p,i)=>`${p.name}: ${statusBadge(p.paid)} ${editable?`<button onclick="togglePayment('${b.id}',${i})">Toggle</button>`:""}`).join("<br>")}</td></tr>`).join("")}</table>`;
}
function allBookings(editable){ $("content").innerHTML = `<div class="card"><h2>All Bookings</h2>${bookingRows(state.bookings, editable)}</div>`; }

function tutorToday(){
  const bookings = state.bookings.filter(b=>b.tutorId===currentUser.id);
  $("content").innerHTML = `<div class="card"><h2>Daily Schedule Table</h2><p class="muted">Shows student/group, course, time, duration, location, and payment.</p>${bookingRows(bookings, true)}</div>`;
}
function availabilityPage(){
  const av = state.availability.filter(a=>a.tutorId===currentUser.id);
  $("content").innerHTML = `<div class="card"><h2>Edit Availability</h2>
  <table class="table"><tr><th>Day</th><th>Start</th><th>End</th><th>Location</th></tr>${av.map(a=>`<tr><td>${a.day}</td><td>${a.start}</td><td>${a.end}</td><td>${a.location}</td></tr>`).join("")}</table>
  <hr><div class="row"><select id="aday"><option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option><option>Saturday</option><option>Sunday</option></select><input id="astart" type="time"><input id="aend" type="time"><input id="aloc" placeholder="Online / Campus"></div>
  <button onclick="addAvailability()">Add Availability</button></div>`;
}
function addAvailability(){
  state.availability.push({tutorId:currentUser.id, day:$("aday").value, start:$("astart").value, end:$("aend").value, location:$("aloc").value});
  save(); availabilityPage();
}
function financialPage(){
  const bookings = state.bookings.filter(b=>b.tutorId===currentUser.id);
  const paid = bookings.flatMap(b=>b.payments).filter(p=>p.paid).reduce((s,p)=>s+p.amount,0);
  const unpaid = bookings.flatMap(b=>b.payments).filter(p=>!p.paid).reduce((s,p)=>s+p.amount,0);
  $("content").innerHTML = `<div class="grid"><div class="card"><h3>Paid</h3><h1>${money(paid)}</h1></div><div class="card"><h3>Unpaid</h3><h1>${money(unpaid)}</h1></div><div class="card"><h3>Bookings</h3><h1>${bookings.length}</h1></div></div><div class="card"><h2>Financial Details</h2>${bookingRows(bookings, true)}</div>`;
}
function togglePayment(bid, i){
  const b = state.bookings.find(x=>x.id===bid);
  b.payments[i].paid = !b.payments[i].paid;
  save();
  if(currentUser.role==="admin") allBookings(true); else financialPage();
}

function bookingPage(){
  const tutors = state.users.filter(u=>u.role==="tutor");
  $("content").innerHTML = `<div class="card"><h2>Book a Session</h2>
  <label>Search Course</label><input id="courseSearch" placeholder="Example: Physics 213" oninput="filterTutors()">
  <div id="tutorResults"></div><hr>
  <div class="row"><select id="bookTutor" onchange="updateTutorDetails()">${tutors.map(t=>`<option value="${t.id}">${t.name}</option>`).join("")}</select><select id="bookCourse"></select></div>
  <div class="row"><input id="bookDate" type="date"><input id="bookTime" type="time"><select id="duration"><option value="1">1 hour</option><option value="1.5">1h 30min</option><option value="2">2 hours</option><option value="2.5">2h 30min</option><option value="3">3 hours</option></select></div>
  <label>Session Format</label><select id="format" onchange="updatePrice()"><option>Individual</option><option>Group</option></select><select id="groupSize" onchange="updatePrice()"><option value="1">1 student</option><option value="2">2 students</option><option value="3">3 students</option><option value="4">4 students</option><option value="5">5 students</option></select>
  <label>Session Type (choose one or more)</label><div class="checkbox-grid">${["Course & Formulas","Book Exercises","Previous Exams","Other"].map(x=>`<label class="check"><input type="checkbox" class="stypeOpt" value="${x}">${x}</label>`).join("")}</div>
  <label>Location</label><select id="bookLocation"></select>
  <p id="priceBox" class="card small"></p>
  <button onclick="confirmBooking()">Confirm Booking + Open WhatsApp</button></div>`;
  updateTutorDetails();
}
function filterTutors(){
  const q = $("courseSearch").value.toLowerCase();
  const found = state.users.filter(u=>u.role==="tutor" && (u.courses||[]).some(c=>c.toLowerCase().includes(q)));
  $("tutorResults").innerHTML = q ? `<div class="grid">${found.map(t=>`<div class="card"><h3>${t.name}</h3><p>${money(t.rate)}/hour/person</p><p>${(t.locations||[]).join(", ")}</p></div>`).join("")}</div>` : "";
}
function updateTutorDetails(){
  const t = tutorObj($("bookTutor").value);
  $("bookCourse").innerHTML = (t.courses||[]).map(c=>`<option>${c}</option>`).join("");
  $("bookLocation").innerHTML = (t.locations||[]).map(l=>`<option>${l}</option>`).join("");
  updatePrice();
}
document.addEventListener("change", e=>{ if(["duration","groupSize","bookTutor"].includes(e.target.id)) updatePrice(); });
function updatePrice(){
  if(!$("bookTutor")) return;
  const t=tutorObj($("bookTutor").value);
  const duration=Number($("duration").value);
  const groupSize=$("format").value==="Group" ? Number($("groupSize").value) : 1;
  const total=t.rate*duration*groupSize;
  $("priceBox").innerHTML = `<b>Rate:</b> ${money(t.rate)}/hour/person<br><b>Duration:</b> ${duration}h<br><b>Students:</b> ${groupSize}<br><b>Total:</b> ${money(total)}`;
}
function confirmBooking(){
  const t=tutorObj($("bookTutor").value), duration=Number($("duration").value);
  const groupSize=$("format").value==="Group" ? Number($("groupSize").value) : 1;
  const location=$("bookLocation").value;
  const method=location.toLowerCase().includes("online") ? "Whish" : "Cash";
  const course=$("bookCourse").value;
  const types=[...document.querySelectorAll(".stypeOpt:checked")].map(x=>x.value);
  const total=t.rate*duration*groupSize;
  let payerNames = currentUser.type==="group" && currentUser.members?.length ? currentUser.members.slice(0,groupSize) : [currentUser.name];
  while(payerNames.length<groupSize) payerNames.push("Student "+(payerNames.length+1));
  const payments = payerNames.map(n=>({name:n, amount:t.rate*duration, paid:false}));
  const b={id:"b"+Date.now(), studentId:currentUser.id, tutorId:t.id, course, date:$("bookDate").value, start:$("bookTime").value, duration, format:$("format").value, groupSize, sessionTypes:types, location, status:"Upcoming", paymentMethod:method, payments, notes:"", attachments:[]};
  state.bookings.push(b); save();
  const msg = encodeURIComponent(`📚 New Tutoring Booking\n\nTutor: ${t.name}\nStudent/Group: ${currentUser.name}\nCourse: ${course}\nDate: ${b.date}\nTime: ${b.start}\nDuration: ${duration}h\nFormat: ${b.format} (${groupSize})\nType: ${types.join(", ")}\nLocation: ${location}\nPayment Method: ${method}\nTotal: ${money(total)}`);
  window.open(`https://wa.me/${t.whatsapp}?text=${msg}`, "_blank");
  alert("Booking saved. WhatsApp opened with the message ready to send.");
}
function mySessions(){ $("content").innerHTML = `<div class="card"><h2>My Sessions</h2>${bookingRows(state.bookings.filter(b=>b.studentId===currentUser.id), false)}</div>`; }
function paymentsPage(){ mySessions(); }
function documentsPage(){
  const canUpload = currentUser.role!=="student";
  const docs = currentUser.role==="student" ? state.documents.filter(d=>d.ownerId===currentUser.id) : state.documents;
  $("content").innerHTML = `<div class="card"><h2>Documents</h2><p class="muted">Demo protected viewer: no download button. Real version can add watermarking and screenshot protection limits.</p>
  <table class="table"><tr><th>File</th><th>Owner</th></tr>${docs.map(d=>`<tr><td>${d.title}</td><td>${studentName(d.ownerId)}</td></tr>`).join("")}</table>
  ${canUpload?`<hr><h3>Add Document</h3><div class="row"><select id="docOwner">${state.users.filter(u=>u.role==="student").map(s=>`<option value="${s.id}">${s.name}</option>`).join("")}</select><input id="docTitle" placeholder="File name"><button onclick="addDoc()">Add Demo File</button></div>`:""}</div>`;
}
function addDoc(){ state.documents.push({ownerId:$("docOwner").value,title:$("docTitle").value}); save(); documentsPage(); }
function profilePage(){
  $("content").innerHTML = `<div class="card"><h2>Profile</h2><p><b>Name:</b> ${currentUser.name}</p><p><b>Role:</b> ${currentUser.role}</p>
  <label>Change Password</label><input id="newpass" type="password" placeholder="New password"><button onclick="changePassword()">Save Password</button>
  ${currentUser.role==="tutor"?`<hr><p><b>WhatsApp:</b> ${currentUser.whatsapp}</p><a target="_blank" href="https://wa.me/${currentUser.whatsapp}"><button class="whatsapp">WhatsApp Contact Button Preview</button></a>`:""}</div>`;
}
function changePassword(){ currentUser.password=$("newpass").value; save(); alert("Password changed."); }
