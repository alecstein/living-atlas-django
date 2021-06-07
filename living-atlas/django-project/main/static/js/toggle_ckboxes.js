function toggleCheckboxes(ckboxname) {
  checkboxes = document.getElementsByName(ckboxname);
  parent = document.getElementsByName(ckboxname.concat("-base"))[0];
  console.log(parent);
  console.log(parent.checked);
  for(var i=0, n=checkboxes.length;i<n;i++) {
    console.log(checkboxes[i]);
    checkboxes[i].checked = parent.checked;
  }
}