let originalHTML = undefined;

window.onload = function() {
  originalHTML = document.getElementById("main-table").innerHTML;
};

function selectAllThisBox(element, tf, lemma) {
  // "all" and "none" buttons select or de-select
  // everything within one box

  const group = element.parentNode.getAttribute("group");
  if (lemma) {
    const allLemmas = document.querySelectorAll('.lemma-item[group="'+group+'"] input');
    let i = 0, len = allLemmas.length;
    while (i < len) {
      let checkVal = allLemmas[i].checked;
      let total = allLemmas[i].parentNode.parentNode.querySelector(".total");
      // Trick for updating the counts quickly
      // tf - checkVal adds 1 or subtracts 1 if needed
      total.innerHTML = parseInt(total.innerHTML) + tf - checkVal;
      allLemmas[i].checked = tf;
      i++;
    }
  }
  else {
    const allForms = document.querySelectorAll('li:not([style="display:none"])[group="'+group+'"].form-item > input');
    let len = allForms.length;
    if (len > 0) {
      let i = 0;
      while (i < len) {
        allForms[i].checked = tf;
        i++;
      }
      allForms[0].onchange();
    }
  }
}

let activeLemma_A;
let activeLemma_B;

function showForms(element) {
  // Shows all the forms when you click on a lemma

  const lemma = element.getAttribute("lemma");
  const group = element.getAttribute("group");

  if (group == "A") {
    if (activeLemma_A != undefined) {
      activeLemma_A.style = "";     
      let activeLemmaName = activeLemma_A.getAttribute("lemma"); 
      const activeFormItems = document.querySelectorAll('.form-item[lemma="'+activeLemmaName+'"][group="'+group+'"]');
      let i = 0, len = activeFormItems.length;
      while (i < len) {
        activeFormItems[i].setAttribute("style", "display:none");
        i++;
      }
    }
    activeLemma_A = element;
  }

  if (group == "B") {
    if (activeLemma_B != undefined) {
      activeLemma_B.style = "";
      let activeLemmaName = activeLemma_B.getAttribute("lemma");
      const activeFormItems = document.querySelectorAll('.form-item[lemma="'+activeLemmaName+'"][group="'+group+'"]');
      let i = 0, len = activeFormItems.length;
      while (i < len) {
        activeFormItems[i].style = "display:none";
        i++;
      }
    }
    activeLemma_B = element;
  }

  element.style = "background-color:#ffe600";
  const formItems = document.querySelectorAll('.form-item[lemma="'+lemma+'"][group="'+group+'"]');
  let i = 0, len = formItems.length;
  while (i < len) {
    formItems[i].style = "display:visible";
    i++;
  }

}

function lemmaToggleAll(element) {
  // If a lemma is checked, it checks all the forms
  // If a form is unchecked, it unchecks all the forms

  const lemma = element.getAttribute("lemma");
  const group = element.getAttribute("group");
  const formItems = document.querySelectorAll('li[lemma="'+lemma+'"][group="'+group+'"].form-item > input');
  let i = 0, len = formItems.length;
  while (i < len) {
    formItems[i].checked = element.checked;
    i++;
  }
}

function toggleParent(element) {
  // If a form is checked, it automatically toggles 
  // the parent lemma

  const lemma = element.getAttribute("lemma");
  const group = element.getAttribute("group");
  const lemmaItem = document.querySelector('li[lemma="'+lemma+'"][group="'+group+'"].lemma-item');
  const lemmaCheckbox = lemmaItem.querySelector('input');
  if (element.checked) {
    lemmaCheckbox.checked = true;
  }
}

function countCheckboxes(element) {
  // Whenever a form or lemma is changed, count the new
  // checkbox totals

  const lemma = element.getAttribute("lemma");
  const group = element.getAttribute("group");
  const allCheckedCheckboxes = document.querySelectorAll('li[lemma="'+lemma+'"][group="'+group+'"] input:checked');
  let total = allCheckedCheckboxes.length;

  const lemmaItem = document.querySelector('.lemma-item[lemma="'+lemma+'"][group="'+group+'"]');
  const lemmaTotal = lemmaItem.querySelector('.total');
  lemmaTotal.innerHTML = total;
}

let lemmaText = "enter one lemma per line, as in\naccommoder\nmobiliaire\npecine";
let regexText = "enter a regular expression, such as\n.deg. (all words containing 'deg')\n^mun (all words that start with 'mun')";

function toggleRegEx(element) {
  // Toggles the placeholder text in the search box
  // and toggles search type
  const searchBox = document.getElementById("searchbox");

  if (element.value == 'regex') {
    searchBox.setAttribute("placeholder", regexText);
  }

  else if (element.value == 'list') {
    searchBox.setAttribute("placeholder", lemmaText);
  }
}

function validateForm(value) {
  // Now check to see if at least one checkbox is selected from this div
  // If no boxes are selected, the form is considered invalid

  if (value == "export") {
    let allCheckedCheckboxes = document.querySelectorAll('li input:checked');
    if (allCheckedCheckboxes.length > 0)
    {
      return true;
    }
    else {
      document.getElementById("export-failed").setAttribute("style", "display:visible")
      return false;
    }
  }

  let formAValid;

  let allCheckedCheckboxesA = document.querySelectorAll('li[group="A"] input:checked');
  if (allCheckedCheckboxesA.length > 0)
  {
    formAValid = true;
  }
  else {
    formAValid = false;
  }
  
  if (!formAValid) {
    console.log("Select at least one item from group A");
    document.getElementById("invalid-submission").setAttribute("style", "display:visible");
    return false;
  }

  let formBValid = false;

  let allCheckedCheckboxesB = document.querySelectorAll('li[group="B"] input:checked');
  if (allCheckedCheckboxesB.length > 0)
  {
    formBValid = true;
  }
  else {
    formBValid = false;
  }

  if (!formBValid) {
    console.log("Select at least one item from group B");
    document.getElementById("invalid-submission").setAttribute("style", "display:visible");
    return false;
  }

  console.log("Form valid");
  document.getElementById("invalid-submission").setAttribute("style", "display:none");
  return true;
}

function queryGroup(item) {
  // Sends a request to the API endpoint to fetch data
  // for either group A or group B.

  let allButtons = document.querySelectorAll(".pushable");
  let allErrors = document.querySelectorAll(".error-container");

  for (let i = allButtons.length - 1; i >= 0; i--) {
    allButtons[i].disabled = true;
  }

  let request = new XMLHttpRequest();
  let method = 'GET';
  let query = document.getElementById("searchbox").value.trim().replace(/\s+/g, '+');
  let group = item.getAttribute("group");
  let type = document.querySelector("input[name='type'][type='radio']:checked").value
  let lang = document.querySelector("input[name='lang'][type='radio']:checked").value
  let url = '/ajax/?query='+query+'&group='+group+'&type='+type+'&lang='+lang;
  console.log(url);
  request.open(method, url);
  request.onload = function () {

    for (let i = allButtons.length - 1; i >= 0; i--) {
      allButtons[i].disabled = false;
    }

    if (request.status == "404") {
      document.getElementById("no-results").setAttribute("style", "display:visible");
      return false;
    }

    //  Whenever we return a new, valid search we clear the error messages
    for (var i = 0; i < allErrors.length; i++) {
      allErrors[i].setAttribute("style", "display:none");
    }
    
    let responseHTML = request.response;

    let headers = request.getAllResponseHeaders();

    // Convert the header string into an array
    // of individual headers
    let arr = headers.trim().split(/[\r\n]+/);

    // Create a map of header names to values
    let headerMap = {};
    arr.forEach(function (line) {
      let parts = line.split(': ');
      let header = parts.shift();
      let value = parts.join(': ');
      headerMap[header] = value;
    });

    if (headerMap['exceeds-limit']) {   
      // let errorExceedsLimit = document.getElementById("too-many-results");

      document.getElementById("exceed-count").innerHTML = headerMap['exceeds-limit'];
      document.getElementById("exceed-limit").innerHTML = headerMap['limit'];
      document.getElementById("too-many-results").setAttribute("style", "display:visible");
    }

    if (group == 'A') {
      document.querySelector('.flex-container[name="A"]').innerHTML = responseHTML;
      // Select the first element ONLY if number of lemmas == 1

      let lemmaCheckboxes = document.querySelectorAll('.lemma-item[group="A"]');
      if (lemmaCheckboxes.length == 1)
      {
        activeLemma_A = document.querySelector('.lemma-item[group="A"]');
        activeLemma_A.onclick();
      }
    }
    else if (group == 'B') {
      document.querySelector('.flex-container[name="B"]').innerHTML = responseHTML;
      let lemmaCheckboxes = document.querySelectorAll('.lemma-item[group="B"]');
      if (lemmaCheckboxes.length == 1)
      {
        activeLemma_B = document.querySelector('.lemma-item[group="B"]');
        activeLemma_B.onclick();
      }
    }
  };
  request.send();
}

function clearAll() {
  // Gets new html template from server to clear the screen

  let allErrors = document.querySelectorAll(".error-container");

  for (var i = 0; i < allErrors.length; i++) {
    allErrors[i].setAttribute("style", "display:none");
  }
  document.getElementById("main-table").innerHTML = originalHTML;

}