let majorTheoryCount=0, majorPracticalCount=0, projectCount=0;
const maxGrace=5, maxGraceSubjects=3;
// Initially add 3 major theory rows
for(let i=0;i<3;i++) addMajorTheory();

// Tab script
function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab-link");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}
document.getElementById("defaultOpen").click();

function updateAllDropdowns() {
    const sem = document.getElementById("semester").value;
    const className = document.getElementById("className").value;
    const semTitle = document.getElementById("semTitle");
    const marksSection = document.getElementById("marksSection");

    if (sem === "" || className === "") {
        return;
    }
    
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('step1').style.display = 'none';
    marksSection.style.display = 'block';
    
    semTitle.innerHTML = "Enter Marks for Semester: " + sem;
    document.getElementById("minorSection").style.display = (sem === "5" || sem === "6") ? "none" : "block";
    document.getElementById("skillSection").style.display = (sem === "5" || sem === "6") ? "none" : "block";
    document.getElementById("projectSection").style.display = (sem === "6") ? "block" : "none";

    populateDropdownGroup('#majorTheorySubjects', 'Major (Theory)');
    populateDropdownGroup('#majorPracticalSubjects', 'Major (Practical)');
    populateDropdownGroup('.minorCode', 'Minor', true);
    populateDropdownGroup('.skillCode', 'Skill Development', true);
    populateDropdownGroup('#projectSubjects', 'Project');
    populateDropdownGroup('.coCurricular', 'Co-Curricular', true);

    const firstInput = document.querySelector('#majorTheorySubjects .majorTheoryExternal');
    if (firstInput) {
        firstInput.focus();
    }
}


function getFilteredSubjects(subjectType) {
    const selectedClass = document.getElementById('className').value;
    const selectedSem = parseInt(document.getElementById('semester').value, 10);
    if (!selectedClass || isNaN(selectedSem)) return [];

    return courseData.filter(course => {
        const classMatch = course.class.includes(selectedClass); 
        const typeMatch = course.subjectType === subjectType;
        
        let semMatch = false;
        if (course.semester.includes('-')) {
            const [start, end] = course.semester.split('-').map(Number);
            semMatch = selectedSem >= start && selectedSem <= end;
        } else {
            semMatch = parseInt(course.semester, 10) === selectedSem;
        }

        return classMatch && typeMatch && semMatch;
    });
}

function populateDropdown(selectElement, subjectType) {
    const subjects = getFilteredSubjects(subjectType);
    selectElement.innerHTML = '<option value="">-- Select Subject --</option>';
    subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject.code;
        option.textContent = `${subject.subject} (${subject.code})`;
        selectElement.appendChild(option);
    });
}

function populateDropdownGroup(containerSelector, subjectType, isSingle = false) {
    if (isSingle) {
        const selectElement = document.querySelector(containerSelector);
        if (selectElement) populateDropdown(selectElement, subjectType);
    } else {
        const container = document.getElementById(containerSelector.substring(1));
        if (container) {
            const dropdowns = container.querySelectorAll('.subjectCode');
            dropdowns.forEach(dd => populateDropdown(dd, subjectType));
        }
    }
}


function addSubject(containerId, name, subjectType, fields) {
    const container = document.getElementById(containerId);
    container.style.display = "block";
    const div = document.createElement("div");
    div.className = "subject";
    
    let inputFieldsHTML = `<label>${name}:</label>
                           <select class="subjectCode" style="flex-grow:1;"><option value="">-- Select Subject --</option></select>`;
    
    fields.forEach(field => {
        inputFieldsHTML += ` ${field.label} <input type="number" class="${field.class}" min="0" max="${field.max}">`;
    });

    div.innerHTML = inputFieldsHTML;
    container.appendChild(div);

    const newSelect = div.querySelector('.subjectCode');
    populateDropdown(newSelect, subjectType);
}

function addMajorTheory() {
    majorTheoryCount++;
    addSubject("majorTheorySubjects", "Major Theory " + majorTheoryCount, "Major (Theory)", [
        { label: "EXT", class: "majorTheoryExternal", max: 75 },
        { label: "INT", class: "majorTheoryInternal", max: 25 }
    ]);
}
function addMajorPractical() {
    majorPracticalCount++;
    addSubject("majorPracticalSubjects", "Major Practical " + majorPracticalCount, "Major (Practical)", [
        { label: "EXT", class: "majorPracticalExternal", max: 75 },
        { label: "INT", class: "majorPracticalInternal", max: 25 }
    ]);
}
function addProject() {
    projectCount++;
    addSubject("projectSubjects", "Project " + projectCount, "Project", [
        { label: "Total", class: "projectMarks", max: 100 }
    ]);
}


function showError(msg){
  var el = document.getElementById('errorMsg');
  if(el){ el.textContent = msg; el.className = 'error-blink'; el.style.display = 'block'; }
}
function hideError(){
  var el = document.getElementById('errorMsg');
  if(el){ el.style.display = 'none'; el.className = '';}
}

function validateMarks() {
    let allValid = true;
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        const value = parseFloat(input.value);
        const max = parseFloat(input.max);
        if (!isNaN(value) && !isNaN(max) && value > max) {
            allValid = false;
        }
    });
    return allValid;
}


function calculateResult(){
  hideError();

  if (!validateMarks()) {
      showError("Entered Marks are more than Max Marks");
      return;
  }

  const studentName = document.getElementById('studentName').value;
  const rollNumber = document.getElementById('rollNumber').value;
  const className = document.getElementById('className').value;
  const semester = document.getElementById('semester').value;

  if (!studentName || !rollNumber || !className || !semester) {
    showError("Please fill in Student Name, Roll Number, Class, and Semester.");
    return;
  }
 
  let majorTheoryFilledCount = 0;
  document.querySelectorAll('#majorTheorySubjects .subject').forEach(div => {
      const extInput = div.querySelector('.majorTheoryExternal');
      const intInput = div.querySelector('.majorTheoryInternal');
      if (extInput && intInput && extInput.value.trim() !== '' && intInput.value.trim() !== '') {
          majorTheoryFilledCount++;
      }
  });

  const coExtInput = document.querySelector('#coCurricularSection .coExternal');
  const coIntInput = document.querySelector('#coCurricularSection .coInternal');
  const isCoCurricularFilled = coExtInput && coIntInput && coExtInput.value.trim() !== '' && coIntInput.value.trim() !== '';

  if (majorTheoryFilledCount < 3) {
      showError("Minimum 3 Major Theory subjects marks are mandatory.");
      return;
  }
  if (!isCoCurricularFilled) {
      showError("Co-Curricular subject marks are mandatory.");
      return;
  }

  let isValid = true;
  function validateEntries(containerSelector, inputs) {
      const subjectDivs = document.querySelectorAll(containerSelector);
      subjectDivs.forEach(div => {
          const select = div.querySelector('select');
          if (select && select.value !== '') { 
              for (const inputClass of inputs) {
                  const input = div.querySelector(`.${inputClass}`);
                  if (input && input.value.trim() === '') {
                      isValid = false;
                  }
              }
          }
      });
  }
  validateEntries('#majorTheorySubjects .subject', ['majorTheoryExternal', 'majorTheoryInternal']);
  validateEntries('#majorPracticalSubjects .subject', ['majorPracticalExternal', 'majorPracticalInternal']);
  validateEntries('#minorSection .subject', ['minorExternal', 'minorInternal']);
  validateEntries('#skillSection .subject', ['skillTheory', 'skillPractical']);
  validateEntries('#coCurricularSection .subject', ['coExternal', 'coInternal']);
  validateEntries('#projectSubjects .subject', ['projectMarks']);

  if (!isValid) {
      showError("Please enter marks for all subjects you have selected.");
      return;
  }

  let selectionIsValid = true;
  function validateSelection(containerSelector, inputs, selectClass = 'subjectCode') {
      const subjectDivs = document.querySelectorAll(containerSelector);
      subjectDivs.forEach(div => {
          const select = div.querySelector(`select.${selectClass}`);
          let marksEntered = false;
          for (const inputClass of inputs) {
              const input = div.querySelector(`.${inputClass}`);
              if (input && input.value.trim() !== '') {
                  marksEntered = true;
                  break;
              }
          }
          if (marksEntered && (!select || select.value === '')) {
              selectionIsValid = false;
          }
      });
  }

  validateSelection('#majorTheorySubjects .subject', ['majorTheoryExternal', 'majorTheoryInternal']);
  validateSelection('#majorPracticalSubjects .subject', ['majorPracticalExternal', 'majorPracticalInternal']);
  validateSelection('#minorSection .subject', ['minorExternal', 'minorInternal'], 'minorCode');
  validateSelection('#skillSection .subject', ['skillTheory', 'skillPractical'], 'skillCode');
  validateSelection('#coCurricularSection .subject', ['coExternal', 'coInternal'], 'coCurricular');
  validateSelection('#projectSubjects .subject', ['projectMarks']);
  
  if (!selectionIsValid) {
      showError("Please select a subject for all rows where marks have been entered.");
      return;
  }
  
  let graceLeft=maxGrace, remainingGraceSubjects=maxGraceSubjects;
  let subjects=[];

  const processMultipleSubjects = (containerSelector, type, extClass, intClass) => {
      const subjectDivs = document.querySelectorAll(`${containerSelector} .subject`);
      subjectDivs.forEach(parent => {
          const selectElement = parent.querySelector('.subjectCode');
          const code = selectElement.value;
          if (!code) return;

          const selectedOption = selectElement.options[selectElement.selectedIndex];
          const subjectName = selectedOption.text.replace(` (${code})`, '');
          const ext = extClass ? Number(parent.querySelector(`.${extClass}`).value) || 0 : 0;
          const intr = intClass ? Number(parent.querySelector(`.${intClass}`).value) || 0 : 0;
          
          if(ext !== 0 || intr !== 0 || type === 'project') {
              subjects.push({ name: subjectName, code, ext, internal: intr, type, grace: 0, initialPass: false });
          }
      });
  };

  const processSingleSubject = (parentSelector, type, codeClass, extClass, intClass) => {
      const parent = document.querySelector(parentSelector);
      if (!parent || parent.style.display === 'none') return;
      
      const selectElement = parent.querySelector(`.${codeClass}`);
      const code = selectElement.value;
      if (!code) return;
      
      const selectedOption = selectElement.options[selectElement.selectedIndex];
      const subjectName = selectedOption.text.replace(` (${code})`, '');
      const ext = extClass ? Number(parent.querySelector(`.${extClass}`).value) || 0 : 0;
      const intr = intClass ? Number(parent.querySelector(`.${intClass}`).value) || 0 : 0;

      if(ext !== 0 || intr !== 0) {
           subjects.push({ name: subjectName, code, ext, internal: intr, type, grace: 0, initialPass: false });
      }
  };

  processMultipleSubjects("#majorTheorySubjects", "majorTheory", "majorTheoryExternal", "majorTheoryInternal");
  processMultipleSubjects("#majorPracticalSubjects", "majorPractical", "majorPracticalExternal", "majorPracticalInternal");
  processMultipleSubjects("#projectSubjects", "project", "projectMarks", null);
  processSingleSubject("#minorSection .subject", "minor", "minorCode", "minorExternal", "minorInternal");
  processSingleSubject("#skillSection .subject", "skill", "skillCode", "skillPractical", "skillTheory");
  processSingleSubject("#coCurricularSection .subject", "coCurricular", "coCurricular", "coExternal", "coInternal");

  function checkPass(subj,extTotal){
    const total=subj.internal+extTotal;
    if(subj.type==="majorTheory"||subj.type==="minor"||subj.type==="majorPractical") return (extTotal>=25 && total>=33);
    if(subj.type==="skill"||subj.type==="coCurricular"||subj.type==="project") return total>=40;
    return false;
  }

  subjects.forEach(subj=>{ subj.initialPass = checkPass(subj,subj.ext); });

  subjects.forEach(subj=>{
    if(graceLeft<=0 || remainingGraceSubjects<=0 || subj.initialPass) return;
    let total=subj.ext+subj.internal;
    let needGrace=0;
    if(subj.type==="majorTheory"||subj.type==="minor"||subj.type==="majorPractical"){
      if(subj.ext<25) needGrace=25-subj.ext;
      if(needGrace===0 && total<33 && subj.ext>=25) needGrace=33-total;
    } else if(subj.type==="skill"||subj.type==="coCurricular"||subj.type==="project"){ if(total<40) needGrace=40-total; }
    if(needGrace>0){ const applied=Math.min(needGrace,graceLeft,maxGrace); subj.ext+=applied; subj.grace+=applied; graceLeft-=applied; remainingGraceSubjects--; }
  });

  let anyFailAfterGrace=false;
  subjects.forEach(subj=>{ if(!checkPass(subj,subj.ext)) anyFailAfterGrace=true; });

  const subjectTypeMap = {
      majorTheory: 'Major (Theory)',
      majorPractical: 'Major (Practical)',
      minor: 'Minor',
      skill: 'Skill Development',
      coCurricular: 'Co-Curricular',
      project: 'Project'
  };

  let tbodyHTML = '';
  subjects.forEach(subj=>{
    let total=subj.ext+subj.internal;
    let status=checkPass(subj,subj.ext)?"Pass":"Fail";
    if(anyFailAfterGrace && subj.grace>0) total = (subj.ext - subj.grace) + subj.internal;
   
    let remark="";
    if(status==="Fail"){
      if(anyFailAfterGrace && subj.grace>0) {
        subj.ext -= subj.grace;
      }
      if(subj.type==="majorTheory"||subj.type==="minor"||subj.type==="majorPractical"){
        if(subj.ext<25) remark=`Need ${25-subj.ext} in External`;
        else if(total<33) remark=`Need ${33-total} in Total`;
      } else { remark=`Need ${40-total} in Total`; }
    } else { remark="-"; }
    if(anyFailAfterGrace && subj.grace>0) remark = `Grace Cancelled - ${remark}`;
    
    let obtainedMarks = subj.ext - subj.grace;
    let internalMarks = subj.internal;
    
    const graceValue = anyFailAfterGrace ? 0 : subj.grace;
    const graceDisplay = graceValue > 0 ? `<span style="color: darkred; font-size: 1.1em; font-weight: bold;">${graceValue}</span>` : '-';

    const trClass = graceValue > 0 ? "graceApplied" : "";
    const statusClass = status === 'Pass' ? 'pass' : 'fail';
    const subjectTypeText = subjectTypeMap[subj.type] || subj.type;
    tbodyHTML += `<tr class="${trClass}"><td>${subjectTypeText}</td><td>${subj.code}</td><td>${subj.name}</td><td>${obtainedMarks}</td><td class="grace">${graceDisplay}</td><td>${subj.ext}</td><td>${internalMarks}</td><td>${total}</td><td class="${statusClass}">${status}</td><td>${remark}</td></tr>`;
  });

  const selectedSemester = document.getElementById('semester').options[document.getElementById('semester').selectedIndex].text;
  const generationTime = new Date().toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const studentDetailsHTML = `<div><b>Name:</b> ${studentName}</div><div><b>Roll No:</b> ${rollNumber}</div><div><b>Program:</b> ${className} (NEP)</div><div><b>Semester:</b> ${selectedSemester}</div><div style="flex-basis: 100%; text-align: right; font-size: 0.8em; margin-top: 5px;"><b>Generated On:</b> ${generationTime}</div>`;
  
  let overallHTML, overallClassName, congratsHTML, playSound;
  if(anyFailAfterGrace){
    const failMessage='(ग्रेस मिलने के बाद भी यदि किसी भी विषय में बैक रहती है तो किसी भी विषय में ग्रेस नहीं मिलेगा)';
    overallHTML=`Overall Result: <span class="fail">FAIL</span><br><small style="color: #333; font-weight: normal;">${failMessage}</small>`;
    overallClassName = 'overall-fail';
    congratsHTML = `<h2>Result</h2>`;
    playSound = false;
  } else {
    let totalGraceApplied = subjects.reduce((sum,subj)=>sum+(anyFailAfterGrace ? 0 : subj.grace),0);
    if(totalGraceApplied>0){
      overallHTML=`Overall Result: <span class="pass">PASS</span><br><small style="color: #333; font-weight: normal;">with Grace (${totalGraceApplied} Marks)</small>`;
    } else {
      overallHTML=`Overall Result: <span class="pass">PASS</span>`;
    }
    overallClassName = 'overall-pass';
    congratsHTML = `<h2 class="flash-animation">🎉 Congratulations! 🎉</h2>`;
    playSound = true;
  }

  openResultInNewTab(studentDetailsHTML, tbodyHTML, overallHTML, overallClassName, congratsHTML, studentName, rollNumber, playSound);
}

function openResultInNewTab(studentDetailsHTML, tbodyHTML, overallHTML, overallClassName, congratsHTML, studentName, rollNumber, playSound) {
    const css = `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
        body { font-family: 'Poppins', sans-serif; background-color: #e9eff5; padding: 0; color: #333; }
        #gradeCard { background: #ffffff; padding: 20px; border-radius: 15px; border: 1px solid #ddd; }
        .header-logo { display: flex; justify-content: center; align-items: center; border-bottom: 2px solid #f0f0f0; padding-bottom: 15px; margin-bottom: 15px; }
        .header-logo .university-info { text-align: center; }
        .header-logo h3 { margin: 0; color: #3498db; font-size: 1.5em; font-weight: 700; }
        .header-logo h4 { margin: 5px 0 0; font-weight: 600; color: #555; font-size: 1.1em; }
        #studentDetails { display: flex; justify-content: space-between; flex-wrap: wrap; margin-bottom: 20px; font-size: 0.95em; padding: 15px; background: #f9fafb; border-radius: 12px; border: 1px solid #e1e8ed; }
        #studentDetails div { flex: 1 1 220px; margin: 5px; }
        #studentDetails b { color: #34495e; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 0.85em; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border-radius: 12px; overflow: hidden; }
        thead { background: linear-gradient(90deg, #3498db, #2980b9); color: white; text-transform: uppercase; letter-spacing: 0.5px; }
        th, td { border: 1px solid #e1e8ed; padding: 12px 10px; text-align: center; }
        tbody tr:nth-child(even) { background-color: #f9fafb; }
        tbody tr:hover { background-color: #f1f8ff; }
        .pass { color: #27ae60; font-weight: bold; }
        .fail { color: #e74c3c; font-weight: bold; }
        .grace { font-weight: bold; }
        .graceApplied { background-color: #fef9e7 !important; }
        #overall { font-size: 1.3em; text-align: center; margin-top: 25px; padding: 15px; border-radius: 12px; font-weight: 700; line-height: 1.5; }
        .overall-pass { background-color: #eafaf1; border: 1px solid #27ae60; color: #333; }
        .overall-fail { background-color: #fdedec; border: 1px solid #e74c3c; color: #333; }
        #note { margin-top: 25px; font-size: 0.8em; text-align: justify; color: #7f8c8d; background-color: #fcfcfc; padding: 15px; border-radius: 8px; border-left: 5px solid #bdc3c7; }
        @keyframes flash { 0%, 100% { transform: scale(1); color: #2980b9; } 50% { transform: scale(1.05); color: #3498db; } }
        .flash-animation { animation: flash 1.5s infinite; text-align: center; }
    `;

    const newPageHTML = `
        <style>${css}</style>
        <div id="gradeCard">
            <div class="header-logo">
                <div class="university-info">
                    <h3>Chaudhary Charan Singh University, Meerut</h3>
                    <h4>Unofficial Grade Card (NEP)</h4>
                </div>
            </div>
            <div id="congratsMsg">${congratsHTML}</div>
            <div id="studentDetails">${studentDetailsHTML}</div>
            <table id="resultTable">
                <thead>
                <tr>
                    <th>Subject Type</th>
                    <th>Sub Code</th>
                    <th>Subject</th>
                    <th>Obtained Marks</th>
                    <th>Grace</th>
                    <th>Final Marks</th>
                    <th>Internal</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Remarks</th>
                </tr>
                </thead>
                <tbody>${tbodyHTML}</tbody>
            </table>
            <div id="overall" class="${overallClassName}">${overallHTML}</div>
            <div id="note">
                <strong>अस्वीकरण:</strong> यह एक अनौपचारिक ग्रेड कार्ड है और केवल सूचना के उद्देश्यों के लिए है। यह चौधरी चरण सिंह विश्वविद्यालय, मेरठ द्वारा जारी आधिकारिक दस्तावेज़ नहीं है। किसी भी विसंगति के लिए, कृपया विश्वविद्यालय के आधिकारिक रिकॉर्ड को देखें।
            </div>
        </div>
    `;

    const popup = document.getElementById('resultPopup');
    const container = document.getElementById('gradeCardContainer');
    container.innerHTML = newPageHTML; 
    popup.style.display = 'flex'; 

    if (playSound) {
        document.getElementById('successSound').play().catch(e => console.log("Audio nahi chala."));
    }
}


function resetForm(){ location.reload(); }

document.addEventListener('DOMContentLoaded', (event) => {
    const checkResultBtn = document.getElementById('checkResultBtn');
    const step1 = document.getElementById('step1');
    const studentName = document.getElementById('studentName');
    const rollNumber = document.getElementById('rollNumber');
    const className = document.getElementById('className');
    const semester = document.getElementById('semester');

    checkResultBtn.addEventListener('click', function() {
        step1.style.display = 'block';
        const rulesSection = document.querySelector('.rules');
        rulesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        setTimeout(() => {
            const studentInfoSection = studentName.closest('.subject-section');
            if (studentInfoSection) {
                 studentInfoSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            studentName.focus();
        }, 3000); 
    });

    const handleEnterNavigation = (currentElement, nextElement) => {
        currentElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                nextElement.focus();
            }
        });
    };

    handleEnterNavigation(studentName, rollNumber);
    handleEnterNavigation(rollNumber, className);
    
    className.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            semester.focus();
        }
    });

});

// --- Popup ko band karne ka logic ---
const resultPopup = document.getElementById('resultPopup');
const closePopupBtn = document.getElementById('closePopupBtn');

// Close button par click karne par popup band ho jayega
closePopupBtn.onclick = function() {
  resultPopup.style.display = 'none';
}

// Popup ke bahar (kaale background par) click karne par bhi band ho jayega
window.onclick = function(event) {
  if (event.target == resultPopup) {
    resultPopup.style.display = 'none';
  }
}
