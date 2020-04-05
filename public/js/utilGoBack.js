let gobackbutton = document.getElementById('goback');
gobackbutton.addEventListener('click', goBack);
function goBack() {
    window.history.back();
}