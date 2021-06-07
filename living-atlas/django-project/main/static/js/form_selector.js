function formSelector(lemma) {

    // get all the formslists and make them invisible
    var allFormsLists = document.getElementsByClassName("forms-list");
    var i;
    for (i = 0; i < allFormsLists.length; i++) {
        allFormsLists[i].style.display = "none";
    }

    // display only the selected formslist
    var thisFormsList = document.getElementById(lemma);
    thisFormsList.style.display = "block";

    // turn all of the lemma items white
    const lemmas = document.querySelectorAll('.lemmas-list li');
    var i;
    for (i = 0; i < lemmas.length; i++) {
        lemmas[i].style.backgroundColor = "white";
    }

    // make the selected item yellow
    var lemmaSelectorName = lemma.concat("-selector");
    document.getElementById(lemmaSelectorName).style.backgroundColor = '#ffe600';
}