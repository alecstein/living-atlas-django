let originalHTML = undefined;

window.onload = function() {
  originalHTML = document.getElementById("main-table").innerHTML;
};

function selectAllThisBox(element, tf, lemma) {
  // "all" and "none" buttons select or de-select
  // everything within one box.
  const group = element.parentNode.getAttribute("group");
  if (lemma) {
    const allLemmas = document.querySelectorAll('li[group="'+group+'"].lemma-item > input');
    let i = 0, len = allLemmas.length;
    while (i < len) {
      allLemmas[i].checked = tf;
      allLemmas[i].onchange();
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
};

let activeLemma_A;
let activeLemma_B;

function showForms(element) {
  // Shows all the forms when you click on a lemma
  const lemma = element.getAttribute("lemma");
  const group = element.getAttribute("group");
  const formItems = document.querySelectorAll('li[lemma="'+lemma+'"][group="'+group+'"].form-item');

  if (group == "A") {
    if (activeLemma_A != undefined) {
      activeLemma_A.style = "";     
      let activeLemmaName = activeLemma_A.getAttribute("lemma"); 
      const formItems = document.querySelectorAll('li[lemma="'+activeLemmaName+'"][group="'+group+'"].form-item');
      let i = 0, len = formItems.length;
      while (i < len) {
        formItems[i].setAttribute("style", "display:none");
        i++;
      }
    }
    activeLemma_A = element;
  }

  if (group == "B") {
    if (activeLemma_B != undefined) {
      activeLemma_B.style = "";
      let activeLemmaName = activeLemma_B.getAttribute("lemma");
      const formItems = document.querySelectorAll('li[lemma="'+activeLemmaName+'"][group="'+group+'"].form-item');
      let i = 0, len = formItems.length;
      while (i < len) {
        formItems[i].style = "display:none";
        i++;
      }
    }
    activeLemma_B = element;
  }

  element.style = "background-color:#ffe600";

  let i = 0, len = formItems.length;
  while (i < len) {
    formItems[i].style = "display:visible";
    i++;
  }

}

function lemmaToggleAll(element) {
  // If a lemma is checked, it checks all the forms
  // If a form is unchecked, it unchecks all the forms
  const lemma = element.parentNode.getAttribute("lemma");
  const group = element.parentNode.getAttribute("group");
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
  const lemma = element.parentNode.getAttribute("lemma");
  const group = element.parentNode.getAttribute("group");
  const lemmaItem = document.querySelector('li[lemma="'+lemma+'"][group="'+group+'"].lemma-item');
  const lemmaCheckbox = lemmaItem.querySelector('input');
  if (element.checked) {
    lemmaCheckbox.checked = true;
  }
}

function countCheckboxes(element) {
  // Whenever a form or lemma is changed, count the new
  // checkbox totals
  const lemma = element.parentNode.getAttribute("lemma");
  const group = element.parentNode.getAttribute("group");
  const allCheckboxes = document.querySelectorAll('li[lemma="'+lemma+'"][group="'+group+'"] > input');
  let total = 0;

  let i = 0, len = allCheckboxes.length;
  while (i < len) {
    total = total + allCheckboxes[i].checked;
    i++;
  }
  const lemmaItem = document.querySelector('li[lemma="'+lemma+'"][group="'+group+'"].lemma-item');
  const lemmaTotal = lemmaItem.querySelector('[class="total"');
  lemmaTotal.innerHTML = total;
}

let lemmaText = "enter one lemma per line, as in\naccommoder\nmobiliaire\npecine";
let regexText = "enter a regular expression, such as\n.deg. (all words containing 'deg')\n^mun (all words that start with 'mun')";

function toggleRegEx(item) {
  // Toggles the placeholder text in the search box
  // and toggles search type
  const searchBox = document.getElementById("searchbox");

  if (item.value == 'regex') {
    searchBox.setAttribute("placeholder", regexText);
  }

  else if (item.value == 'list') {
    searchBox.setAttribute("placeholder", lemmaText);
  }
}

function validateForm() {
  // Now check to see if at least one checkbox is selected from this div
  // If no boxes are selected, the form is considered invalid

  let allCheckboxesA = document.querySelectorAll('li[group="A"] > input');

  let formAValid = false;

  for (let i = allCheckboxesA.length - 1; i >= 0; i--) {
    if (allCheckboxesA[i].checked) {
      console.log("Group A valid");
      formAValid = true;
      break;
    }
  }

  if (!formAValid) {
    console.log("Select at least one item from group A");
    document.getElementById("invalid-submission").setAttribute("style", "display:visible");
    return false;
  }

  let formBValid = false;

  let allCheckboxesB = document.querySelectorAll('li[group="B"] > input');

  for (let i = allCheckboxesB.length - 1; i >= 0; i--) {
    if (allCheckboxesB[i].checked) {
      console.log("Group B valid");
      formBValid = true;
      break;
    }
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

  let allButtons = document.querySelectorAll('[class="pushable"]');

  for (let i = allButtons.length - 1; i >= 0; i--) {
    allButtons[i].disabled = true;
  }

  let request = new XMLHttpRequest();
  let method = 'GET';
  let query = 'q=' + document.getElementById("searchbox").value.replace(/\s/gm, '+');
  let AorB = 'AorB=' + item.id;
  let type = "type=list";
  if (document.getElementById("radio-regex").checked) {
    type = "type=regex";
  }
  let url = '/ajax/?' + query + '&' + AorB + '&' + type;
  request.open(method, url);
  request.onload = function () {

    for (let i = allButtons.length - 1; i >= 0; i--) {
      allButtons[i].disabled = false;
    }

    if (request.status == "404") {
      // If we get a 404 from the AJAX endpoint
      // that means no results were found
      console.log(request.response);
      document.getElementById("no-results").setAttribute("style", "display:visible");
      return false;
    }

    //  Whenever we return a new, valid search we clear the error messages
    document.getElementById("invalid-submission").setAttribute("style", "display:none");
    document.getElementById("no-results").setAttribute("style", "display:none");

    let myHTML = request.response;

    if (item.id == 'qA') {
      document.querySelector('.flex-container[name="A"]').innerHTML = myHTML;
      activeLemma_A = null;
    }
    else if (item.id == 'qB') {
      document.querySelector('.flex-container[name="B"]').innerHTML = myHTML;
      activeLemma_B = null;
    }
  };
  request.send();
}

function clearAll() {
  // Gets new html template from server to clear the screen
  document.getElementById("invalid-submission").setAttribute("style", "display:none");
  document.getElementById("no-results").setAttribute("style", "display:none");
  document.getElementById("main-table").innerHTML = originalHTML;

}